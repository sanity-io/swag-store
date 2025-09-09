import type {I18nBase} from '@shopify/hydrogen';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
  currency: string;
  label: string;
  flag: string;
}

// Supported locales configuration
export const SUPPORTED_LOCALES: I18nLocale[] = [
  {
    language: 'EN',
    country: 'US',
    pathPrefix: '',
    currency: 'USD',
    label: 'United States',
    flag: '🇺🇸',
  },
  {
    language: 'NO',
    country: 'NO', 
    pathPrefix: '/no-no',
    currency: 'NOK',
    label: 'Norway',
    flag: '🇳🇴',
  },
  {
    language: 'EN',
    country: 'CA',
    pathPrefix: '/en-ca',
    currency: 'CAD',
    label: 'Canada',
    flag: '🇨🇦',
  },
  {
    language: 'EN',
    country: 'GB',
    pathPrefix: '/en-gb',
    currency: 'GBP',
    label: 'United Kingdom',
    flag: '🇬🇧',
  },
  {
    language: 'FR',
    country: 'FR',
    pathPrefix: '/fr-fr',
    currency: 'EUR',
    label: 'France',
    flag: '🇫🇷',
  },
  {
    language: 'DE',
    country: 'DE',
    pathPrefix: '/de-de',
    currency: 'EUR',
    label: 'Germany',
    flag: '🇩🇪',
  },
  {
    language: 'ES',
    country: 'ES',
    pathPrefix: '/es-es',
    currency: 'EUR',
    label: 'Spain',
    flag: '🇪🇸',
  },
  {
    language: 'IT',
    country: 'IT',
    pathPrefix: '/it-it',
    currency: 'EUR',
    label: 'Italy',
    flag: '🇮🇹',
  },
  {
    language: 'JA',
    country: 'JP',
    pathPrefix: '/ja-jp',
    currency: 'JPY',
    label: 'Japan',
    flag: '🇯🇵',
  },
  {
    language: 'KO',
    country: 'KR',
    pathPrefix: '/ko-kr',
    currency: 'KRW',
    label: 'South Korea',
    flag: '🇰🇷',
  },
  {
    language: 'ZH',
    country: 'CN',
    pathPrefix: '/zh-cn',
    currency: 'CNY',
    label: 'China',
    flag: '🇨🇳',
  },
];

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toLowerCase() ?? '';

  // Default locale
  let locale: I18nLocale = SUPPORTED_LOCALES[0];

  // Check if the path matches any supported locale
  if (firstPathPart && firstPathPart.includes('-')) {
    const pathLocale = SUPPORTED_LOCALES.find(
      (l) => l.pathPrefix.toLowerCase() === `/${firstPathPart}`.toLowerCase(),
    );
    if (pathLocale) {
      locale = pathLocale;
    }
  }

  return locale;
}

export function getLocaleByPath(path: string): I18nLocale | undefined {
  return SUPPORTED_LOCALES.find((locale) => locale.pathPrefix === path);
}

export function getLocaleByLanguageAndCountry(
  language: string,
  country: string,
): I18nLocale | undefined {
  return SUPPORTED_LOCALES.find(
    (locale) =>
      locale.language.toLowerCase() === language.toLowerCase() &&
      locale.country.toLowerCase() === country.toLowerCase(),
  );
}
