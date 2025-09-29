import type {I18nBase} from '@shopify/hydrogen';
import type {Storefront} from '@shopify/hydrogen';
import {fetchLocalizationData} from './localization';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
  currency: string;
  label: string;
  flag: string;
}

// Cache for supported locales to avoid repeated API calls
let cachedLocales: I18nLocale[] | null = null;
let localesPromise: Promise<I18nLocale[]> | null = null;

/**
 * Gets supported locales, fetching from Shopify API if not cached
 */
export async function getSupportedLocales(storefront: Storefront): Promise<I18nLocale[]> {
  // Return cached locales if available
  if (cachedLocales) {
    return cachedLocales;
  }

  // Return existing promise if already fetching
  if (localesPromise) {
    return localesPromise;
  }

  // Fetch locales from Shopify API
  localesPromise = fetchLocalizationData(storefront).then(locales => {
    cachedLocales = locales;
    return locales;
  });

  return localesPromise;
}

/**
 * Gets supported locales synchronously (returns cached or fallback)
 * Use this when you need immediate access and can't await
 */
export function getSupportedLocalesSync(): I18nLocale[] {
  return cachedLocales || getFallbackLocales();
}

/**
 * Fallback locales for when API is not available
 */
function getFallbackLocales(): I18nLocale[] {
  return [
    {
      language: 'EN',
      country: 'US',
      pathPrefix: '',
      currency: 'USD',
      label: 'United States',
      flag: '🇺🇸',
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
      language: 'EN',
      country: 'AU',
      pathPrefix: '/en-au',
      currency: 'AUD',
      label: 'Australia',
      flag: '🇦🇺',
    },
    {
      language: 'EN',
      country: 'DE',
      pathPrefix: '/en-de',
      currency: 'EUR',
      label: 'Germany',
      flag: '🇩🇪',
    },
    {
      language: 'EN',
      country: 'FR',
      pathPrefix: '/en-fr',
      currency: 'EUR',
      label: 'France',
      flag: '🇫🇷',
    },
    {
      language: 'EN',
      country: 'IT',
      pathPrefix: '/en-it',
      currency: 'EUR',
      label: 'Italy',
      flag: '🇮🇹',
    },
    {
      language: 'EN',
      country: 'ES',
      pathPrefix: '/en-es',
      currency: 'EUR',
      label: 'Spain',
      flag: '🇪🇸',
    },
    {
      language: 'EN',
      country: 'JP',
      pathPrefix: '/en-jp',
      currency: 'JPY',
      label: 'Japan',
      flag: '🇯🇵',
    },
    {
      language: 'EN',
      country: 'KR',
      pathPrefix: '/en-kr',
      currency: 'KRW',
      label: 'South Korea',
      flag: '🇰🇷',
    },
    {
      language: 'EN',
      country: 'CN',
      pathPrefix: '/en-cn',
      currency: 'CNY',
      label: 'China',
      flag: '🇨🇳',
    },
    {
      language: 'EN',
      country: 'BR',
      pathPrefix: '/en-br',
      currency: 'USD',
      label: 'Brazil',
      flag: '🇧🇷',
    },
    {
      language: 'EN',
      country: 'IN',
      pathPrefix: '/en-in',
      currency: 'USD',
      label: 'India',
      flag: '🇮🇳',
    },
    {
      language: 'EN',
      country: 'SG',
      pathPrefix: '/en-sg',
      currency: 'USD',
      label: 'Singapore',
      flag: '🇸🇬',
    },
    {
      language: 'EN',
      country: 'NL',
      pathPrefix: '/en-nl',
      currency: 'EUR',
      label: 'Netherlands',
      flag: '🇳🇱',
    },
    {
      language: 'EN',
      country: 'SE',
      pathPrefix: '/en-se',
      currency: 'SEK',
      label: 'Sweden',
      flag: '🇸🇪',
    },
    {
      language: 'EN',
      country: 'NO',
      pathPrefix: '/en-no',
      currency: 'NOK',
      label: 'Norway',
      flag: '🇳🇴',
    },
    {
      language: 'EN',
      country: 'DK',
      pathPrefix: '/en-dk',
      currency: 'DKK',
      label: 'Denmark',
      flag: '🇩🇰',
    },
    {
      language: 'EN',
      country: 'FI',
      pathPrefix: '/en-fi',
      currency: 'EUR',
      label: 'Finland',
      flag: '🇫🇮',
    },
    {
      language: 'EN',
      country: 'CH',
      pathPrefix: '/en-ch',
      currency: 'CHF',
      label: 'Switzerland',
      flag: '🇨🇭',
    },
  ];
}

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toLowerCase() ?? '';

  // Get supported locales (synchronously - will use cache or fallback)
  const supportedLocales = getSupportedLocalesSync();
  
  // Default locale
  let locale: I18nLocale = supportedLocales[0];

  // Check if the path matches any supported locale
  if (firstPathPart && firstPathPart.includes('-')) {
    const pathLocale = supportedLocales.find(
      (l) => l.pathPrefix.toLowerCase() === `/${firstPathPart}`.toLowerCase(),
    );
    if (pathLocale) {
      locale = pathLocale;
    }
  }

  return locale;
}

export function getLocaleByPath(path: string): I18nLocale | undefined {
  const supportedLocales = getSupportedLocalesSync();
  return supportedLocales.find((locale) => locale.pathPrefix === path);
}

export function getLocaleByLanguageAndCountry(
  language: string,
  country: string,
): I18nLocale | undefined {
  const supportedLocales = getSupportedLocalesSync();
  return supportedLocales.find(
    (locale) =>
      locale.language.toLowerCase() === language.toLowerCase() &&
      locale.country.toLowerCase() === country.toLowerCase(),
  );
}
