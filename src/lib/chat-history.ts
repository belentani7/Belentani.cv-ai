export const MAX_CHAT_MESSAGE_CHARS = 8000;
export const MAX_CHAT_MESSAGES = 10;
const MAX_HISTORY_BYTES = 48000;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

/** Bound old provider/stored messages as well as new input, keeping newest context. */
export function buildChatHistory(messages: ChatMessage[]): ChatMessage[] {
  const history: ChatMessage[] = [];
  const encoder = new TextEncoder();
  for (const message of messages.slice(-MAX_CHAT_MESSAGES).reverse()) {
    const entry = { role: message.role, content: message.content.slice(0, MAX_CHAT_MESSAGE_CHARS) };
    const next = [entry, ...history];
    if (encoder.encode(JSON.stringify(next)).length > MAX_HISTORY_BYTES) break;
    history.unshift(entry);
  }
  return history;
}
