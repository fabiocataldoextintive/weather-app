import type { AppLocale } from '../../i18n/app-locale';
import { translate } from '../../i18n/translate';

export function toWeatherUserMessage(err: Error, locale: AppLocale = 'en'): string {
  const raw = err.message ?? '';
  if (/location/i.test(raw) || /no matching/i.test(raw)) {
    return translate('err.locationNotFound', locale);
  }
  if (/Weather API request failed/i.test(raw)) {
    return raw.replace(/^Weather API request failed:\s*/i, translate('err.apiLoadPrefix', locale));
  }
  return translate('err.generic', locale);
}
