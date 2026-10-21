import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [currentToast, setCurrentToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-24)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -24,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (options: ToastOptions | string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const opts: ToastOptions =
        typeof options === "string" ? { message: options } : options;
      const type: ToastType = opts.type || "info";
      const duration: number = opts.duration ?? 3500;

      setCurrentToast({ message: opts.message, type });

      opacity.setValue(0);
      translateY.setValue(-24);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacity, translateY]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "success", duration });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "error", duration });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "info", duration });
    },
    [showToast]
  );

  const getBorderColor = () => {
    switch (currentToast?.type) {
      case "success":
        return "rgba(16, 185, 129, 0.5)";
      case "error":
        return "rgba(239, 68, 68, 0.5)";
      case "info":
      default:
        return "rgba(14, 165, 233, 0.5)";
    }
  };

  const getIcon = () => {
    switch (currentToast?.type) {
      case "success":
        return <CheckCircle2 size={19} color="#10B981" />;
      case "error":
        return <AlertCircle size={19} color="#EF4444" />;
      case "info":
      default:
        return <Info size={19} color="#0284C7" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, hideToast }}>
      {children}
      {currentToast && (
        <View
          pointerEvents="box-none"
          style={[styles.toastContainer, { top: Math.max(insets.top, 14) + 6 }]}
        >
          <Animated.View
            style={[
              styles.toastBubble,
              {
                opacity,
                transform: [{ translateY }],
                backgroundColor: isDark
                  ? "rgba(15, 23, 42, 0.94)"
                  : "rgba(255, 255, 255, 0.96)",
                borderColor: getBorderColor(),
              },
            ]}
          >
            <View style={styles.iconWrapper}>{getIcon()}</View>
            <Text
              style={[
                styles.messageText,
                { color: isDark ? "#F8FAFC" : "#0F172A" },
              ]}
              numberOfLines={3}
            >
              {currentToast.message}
            </Text>
            <Pressable onPress={hideToast} hitSlop={8} style={styles.closeButton}>
              <X size={15} color={isDark ? "#94A3B8" : "#64748B"} />
            </Pressable>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  toastBubble: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 480,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrapper: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: 8,
    padding: 2,
    opacity: 0.85,
  },
});
