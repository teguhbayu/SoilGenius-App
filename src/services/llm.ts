import { LlmCompletionRequest, LlmCompletionResponse } from '@/types/chat';
import { getCandidateBaseUrls } from '@/services/soil-data';

export async function requestLlmCompletion(
  request: LlmCompletionRequest
): Promise<LlmCompletionResponse> {
  const candidates = getCandidateBaseUrls(request.ip, request.port);
  let lastError: Error | null = null;

  for (const baseUrl of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const url = `${baseUrl}/api/v1/ai/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          history: request.history.map((h) => ({
            role: h.role,
            content: h.content,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Server error ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) errorMsg = parsed.message;
        } catch {}
        throw new Error(errorMsg);
      }

      const json = await response.json();
      if (json && json.data && typeof json.data.content === 'string') {
        return {
          content: json.data.content,
        };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw (
    lastError ||
    new Error('Gagal menghubungi server AI SoilGenius. Pastikan API server aktif.')
  );
}
