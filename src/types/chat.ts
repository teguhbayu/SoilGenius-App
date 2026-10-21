export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface ChatSuggestion {
  id: string;
  label: string;
  prompt: string;
}

export interface LlmCompletionRequest {
  history: ChatMessage[];
  message: string;
  ip?: string;
  port?: string;
}

export interface LlmCompletionResponse {
  content: string;
}
