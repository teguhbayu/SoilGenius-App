import { LlmCompletionRequest, LlmCompletionResponse } from '@/types/chat';

export async function requestLlmCompletion(
  request: LlmCompletionRequest
): Promise<LlmCompletionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const sampleResponses: Record<string, string> = {
    ph: 'Kondisi pH tanah ideal untuk sebagian besar tanaman hortikultura berkisar antara 6.0 - 7.0. Jika pH di bawah 6.0 (terlalu asam), Anda dapat mengaplikasikan kapur dolomit (CaMg(CO3)2) sebanyak 1-2 ton/ha secara merata sebelum masa tanam.',
    pupuk: 'Untuk pupuk fase awal pertumbuhan (vegetatif), prioritaskan pupuk berkadar Nitrogen tinggi atau pupuk organik matang (kompos/kascing). Saat memasuki fase pembungaan dan pembuahan (generatif), tingkatkan unsur Fosfor (P) dan Kalium (K).',
    air: 'Kelembapan tanah optimal berada pada rentang 60% - 75%. Jika tanah terlalu basah atau jenuh air (>80%), pastikan saluran drainase sedalam minimal 20 cm lancar agar akar terhindar dari penyakit busuk akar dan jamur pythium.',
  };

  const lower = request.message.toLowerCase();
  let selectedResponse = '';

  if (lower.includes('ph') || lower.includes('asam') || lower.includes('basa')) {
    selectedResponse = sampleResponses.ph;
  } else if (lower.includes('pupuk') || lower.includes('nutrisi') || lower.includes('kompos')) {
    selectedResponse = sampleResponses.pupuk;
  } else if (lower.includes('air') || lower.includes('lembab') || lower.includes('siram') || lower.includes('basah')) {
    selectedResponse = sampleResponses.air;
  } else {
    selectedResponse = `Halo! Saya asisten agronomi SoilGenius AI. Terima kasih atas pertanyaan Anda mengenai "${request.message}".\n\nUntuk menjaga produktivitas lahan, selalu pantau telemetri pH, suhu, dan kelembapan secara berkala melalui dashboard. Anda dapat mengganti fungsi requestLlmCompletion() ini langsung dengan API LLM pilihan Anda.`;
  }

  return {
    content: selectedResponse,
  };
}
