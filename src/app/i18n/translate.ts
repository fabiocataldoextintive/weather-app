import type { AppLocale } from './app-locale';
import { MESSAGES, type MessageId } from './messages';

export function translate(
  id: MessageId,
  locale: AppLocale,
  params?: Record<string, string | number>,
): string {
  let text = MESSAGES[locale][id] ?? MESSAGES.en[id] ?? id;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      text = text.replaceAll(`{${key}}`, String(value));
    }
  }
  return text;
}
