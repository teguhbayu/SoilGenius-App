export const PLANT_IMAGE_MAP: Record<string, string> = {
  sorgum:
    "https://res.cloudinary.com/dyk5irgia/image/authenticated/s--YrVsdWjG--/v1792586723/gw5dyfnc0qhngk3hzz9c.jpg",
  cabai:
    "https://res.cloudinary.com/dyk5irgia/image/authenticated/s--_G26Z-e---/v1792586651/qbdkxvp96fuwjaj4ee3d.webp",
  sawi:
    "https://res.cloudinary.com/dyk5irgia/image/authenticated/s--LxrFT55s--/v1792586645/bfpxhrzozmm8utata4aw.jpg",
  kacang:
    "https://res.cloudinary.com/dyk5irgia/image/authenticated/s--7t5sKsGT--/v1792586883/pqvkmjs52ociyu66u4u3.jpg",
  milet:
    "https://res.cloudinary.com/dyk5irgia/image/authenticated/s--8iBqgZzT--/v1792586936/mnssshyrzsgaljp5mi17.jpg",
  default:
    "https://res.cloudinary.com/dyk5irgia/image/authenticated/s--Vg9a4aEe--/v1792587034/kf0mlowo2oblht53qtu1.jpg",
};

export function getCropImage(
  category?: string,
  name?: string,
  directImage?: string,
): string {
  if (directImage && directImage.startsWith("http")) {
    return directImage;
  }

  const catKey = (category || "").trim().toLowerCase();
  if (catKey && PLANT_IMAGE_MAP[catKey]) {
    return PLANT_IMAGE_MAP[catKey];
  }

  const nameKey = (name || "").toLowerCase();
  if (nameKey.includes("sorgum") || nameKey.includes("sorghum")) {
    return PLANT_IMAGE_MAP.sorgum;
  }
  if (
    nameKey.includes("cabai") ||
    nameKey.includes("cabe") ||
    nameKey.includes("chili") ||
    nameKey.includes("pepper")
  ) {
    return PLANT_IMAGE_MAP.cabai;
  }
  if (
    nameKey.includes("sawi") ||
    nameKey.includes("mustard") ||
    nameKey.includes("pakcoy") ||
    nameKey.includes("bok choy")
  ) {
    return PLANT_IMAGE_MAP.sawi;
  }
  if (
    nameKey.includes("kacang") ||
    nameKey.includes("peanut") ||
    nameKey.includes("bean") ||
    nameKey.includes("kedelai")
  ) {
    return PLANT_IMAGE_MAP.kacang;
  }
  if (nameKey.includes("milet") || nameKey.includes("millet")) {
    return PLANT_IMAGE_MAP.milet;
  }

  return PLANT_IMAGE_MAP.default;
}
