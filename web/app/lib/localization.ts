import type {Storefront} from '@shopify/hydrogen';
import type {I18nLocale} from './i18n';

// GraphQL query to fetch localization data from Shopify Storefront API
const LOCALIZATION_QUERY = `#graphql
  query AllLocalizations {
    localization {
      availableCountries {
        isoCode
        name
        availableLanguages {
          isoCode
          endonymName
        }
      }
    }
  }
` as const;

// Currency mapping for different countries
const CURRENCY_MAP: Record<string, string> = {
  'US': 'USD',
  'CA': 'CAD', 
  'GB': 'GBP',
  'FR': 'EUR',
  'DE': 'EUR',
  'ES': 'EUR',
  'IT': 'EUR',
  'NO': 'NOK',
  'JP': 'JPY',
  'KR': 'KRW',
  'CN': 'CNY',
  'AU': 'AUD',
  'BE': 'EUR',
  'NL': 'EUR',
  'AT': 'EUR',
  'CH': 'CHF',
  'SE': 'SEK',
  'DK': 'DKK',
  'FI': 'EUR',
  'IE': 'EUR',
  'PT': 'EUR',
  'GR': 'EUR',
  'PL': 'PLN',
  'CZ': 'CZK',
  'HU': 'HUF',
  'RO': 'RON',
  'BG': 'BGN',
  'HR': 'HRK',
  'SI': 'EUR',
  'SK': 'EUR',
  'LT': 'EUR',
  'LV': 'EUR',
  'EE': 'EUR',
  'CY': 'EUR',
  'LU': 'EUR',
  'MT': 'EUR',
};

// Flag emoji mapping for different countries
const FLAG_MAP: Record<string, string> = {
  'US': '🇺🇸',
  'CA': '🇨🇦',
  'GB': '🇬🇧',
  'FR': '🇫🇷',
  'DE': '🇩🇪',
  'ES': '🇪🇸',
  'IT': '🇮🇹',
  'NO': '🇳🇴',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'CN': '🇨🇳',
  'AU': '🇦🇺',
  'BE': '🇧🇪',
  'NL': '🇳🇱',
  'AT': '🇦🇹',
  'CH': '🇨🇭',
  'SE': '🇸🇪',
  'DK': '🇩🇰',
  'FI': '🇫🇮',
  'IE': '🇮🇪',
  'PT': '🇵🇹',
  'GR': '🇬🇷',
  'PL': '🇵🇱',
  'CZ': '🇨🇿',
  'HU': '🇭🇺',
  'RO': '🇷🇴',
  'BG': '🇧🇬',
  'HR': '🇭🇷',
  'SI': '🇸🇮',
  'SK': '🇸🇰',
  'LT': '🇱🇹',
  'LV': '🇱🇻',
  'EE': '🇪🇪',
  'CY': '🇨🇾',
  'LU': '🇱🇺',
  'MT': '🇲🇹',
};

interface ShopifyLocalizationData {
  localization: {
    availableCountries: Array<{
      isoCode: string;
      name: string;
      availableLanguages: Array<{
        isoCode: string;
        endonymName: string;
      }>;
    }>;
  };
}

/**
 * Fetches localization data from Shopify Storefront API and transforms it into I18nLocale format
 */
export async function fetchLocalizationData(storefront: Storefront): Promise<I18nLocale[]> {
  try {
    const response = await storefront.query(LOCALIZATION_QUERY);

    const data = response as ShopifyLocalizationData;

    
    if (!data?.localization?.availableCountries) {
      console.warn('No localization data available from Shopify. Response:', data);
      return getFallbackLocales();
    }

    const locales: I18nLocale[] = [];

    for (const country of data.localization.availableCountries) {
      for (const language of country.availableLanguages) {

        const pathPrefix = language.isoCode === 'EN' && country.isoCode === 'US' 
          ? '' 
          : `/${language.isoCode.toLowerCase()}-${country.isoCode.toLowerCase()}`;
        
        const currency = CURRENCY_MAP[country.isoCode] || 'USD';
        const flag = FLAG_MAP[country.isoCode] || '🌍';
        
        locales.push({
          language: language.isoCode as any,
          country: country.isoCode as any,
          pathPrefix,
          currency,
          label: country.name,
          flag,
        });
      }
    }

    // Sort locales with US English first, then alphabetically
    const sortedLocales = locales.sort((a, b) => {
      if (a.country === 'US' && a.language === 'EN') return -1;
      if (b.country === 'US' && b.language === 'EN') return 1;
      return a.label.localeCompare(b.label);
    });

    return sortedLocales;

  } catch (error) {
    console.error('Error fetching localization data:', error);
    return getFallbackLocales();
  }
}

/**
 * Fallback locales in case the API call fails
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
      country: 'AD',
      pathPrefix: '/en-ad',
      currency: 'USD',
      label: 'Andorra',
      flag: '🇦🇩',
    },
    {
      language: 'EN',
      country: 'AR',
      pathPrefix: '/en-ar',
      currency: 'USD',
      label: 'Argentina',
      flag: '🇦🇷',
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
      country: 'AT',
      pathPrefix: '/en-at',
      currency: 'EUR',
      label: 'Austria',
      flag: '🇦🇹',
    },
    {
      language: 'EN',
      country: 'BH',
      pathPrefix: '/en-bh',
      currency: 'USD',
      label: 'Bahrain',
      flag: '🇧🇭',
    },
    {
      language: 'EN',
      country: 'BE',
      pathPrefix: '/en-be',
      currency: 'EUR',
      label: 'Belgium',
      flag: '🇧🇪',
    },
    {
      language: 'EN',
      country: 'BA',
      pathPrefix: '/en-ba',
      currency: 'USD',
      label: 'Bosnia & Herzegovina',
      flag: '🇧🇦',
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
      country: 'BG',
      pathPrefix: '/en-bg',
      currency: 'BGN',
      label: 'Bulgaria',
      flag: '🇧🇬',
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
  country: 'CN',
  pathPrefix: '/en-cn',
  currency: 'CNY',
  label: 'China',
  flag: '🇨🇳',
},
 {
  language: 'EN',
  country: 'CO',
  pathPrefix: '/en-co',
  currency: 'USD',
  label: 'Colombia',
  flag: '🇨🇴',
},
 {
  language: 'EN',
  country: 'HR',
  pathPrefix: '/en-hr',
  currency: 'HRK',
  label: 'Croatia',
  flag: '🇭🇷',
},
 {
  language: 'EN',
  country: 'CY',
  pathPrefix: '/en-cy',
  currency: 'EUR',
  label: 'Cyprus',
  flag: '🇨🇾',
},
 {
  language: 'EN',
  country: 'CZ',
  pathPrefix: '/en-cz',
  currency: 'CZK',
  label: 'Czechia',
  flag: '🇨🇿',
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
  country: 'FR',
  pathPrefix: '/en-fr',
  currency: 'EUR',
  label: 'France',
  flag: '🇫🇷',
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
  country: 'GH',
  pathPrefix: '/en-gh',
  currency: 'USD',
  label: 'Ghana',
  flag: '🇬🇭',
},
 {
  language: 'EN',
  country: 'GR',
  pathPrefix: '/en-gr',
  currency: 'EUR',
  label: 'Greece',
  flag: '🇬🇷',
},
 {
  language: 'EN',
  country: 'HK',
  pathPrefix: '/en-hk',
  currency: 'USD',
  label: 'Hong Kong SAR',
  flag: '🇭🇰',
},
 {
  language: 'EN',
  country: 'HU',
  pathPrefix: '/en-hu',
  currency: 'HUF',
  label: 'Hungary',
  flag: '🇭🇺',
},
  
 {
  language: 'EN',
  country: 'IS',
  pathPrefix: '/en-is',
  currency: 'USD',
  label: 'Iceland',
  flag: '🇮🇸',
},
 {
  language: 'EN',
  country: 'IE',
  pathPrefix: '/en-ie',
  currency: 'EUR',
  label: 'Ireland',
  flag: '🇮🇪',
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
  country: 'JP',
  pathPrefix: '/en-jp',
  currency: 'JPY',
  label: 'Japan',
  flag: '🇯🇵',
},
 {
  language: 'EN',
  country: 'JE',
  pathPrefix: '/en-je',
  currency: 'USD',
  label: 'Jersey',
  flag: '🇯🇪',
},
 {
  language: 'EN',
  country: 'JO',
  pathPrefix: '/en-jo',
  currency: 'USD',
  label: 'Jordan',
  flag: '🇯🇴',
},

 {
  language: 'EN',
  country: 'KW',
  pathPrefix: '/en-kw',
  currency: 'USD',
  label: 'Kuwait',
  flag: '🇰🇼',
},
 {
  language: 'EN',
  country: 'LV',
  pathPrefix: '/en-lv',
  currency: 'EUR',
  label: 'Latvia',
  flag: '🇱🇻',
},
 {
  language: 'EN',
  country: 'LI',
  pathPrefix: '/en-li',
  currency: 'USD',
  label: 'Liechtenstein',
  flag: '🇱🇮',
},
 {
  language: 'EN',
  country: 'LT',
  pathPrefix: '/en-lt',
  currency: 'EUR',
  label: 'Lithuania',
  flag: '🇱🇹',
},
 {
  language: 'EN',
  country: 'LU',
  pathPrefix: '/en-lu',
  currency: 'EUR',
  label: 'Luxembourg',
  flag: '🇱🇺',
},
    {
      language: 'EN',
      country: 'MO',
      pathPrefix: '/en-mo',
      currency: 'USD',
      label: 'Macao SAR',
      flag: '🇲🇴',
    },
    {
      language: 'EN',
      country: 'MY',
      pathPrefix: '/en-my',
      currency: 'USD',
      label: 'Malaysia',
      flag: '🇲🇾',
    },
    {
      language: 'EN',
      country: 'MT',
      pathPrefix: '/en-mt',
      currency: 'EUR',
      label: 'Malta',
      flag: '🇲🇹',
    },
    {
      language: 'EN',
      country: 'MC',
      pathPrefix: '/en-mc',
      currency: 'USD',
      label: 'Monaco',
      flag: '🇲🇨',
    },
    {
      language: 'EN',
      country: 'ME',
      pathPrefix: '/en-me',
      currency: 'USD',
      label: 'Montenegro',
      flag: '🇲🇪',
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
      country: 'NZ',
      pathPrefix: '/en-nz',
      currency: 'USD',
      label: 'New Zealand',
      flag: '🇳🇿',
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
      country: 'PE',
      pathPrefix: '/en-pe',
      currency: 'USD',
      label: 'Peru',
      flag: '🇵🇪',
    },
    {
      language: 'EN',
      country: 'PH',
      pathPrefix: '/en-ph',
      currency: 'USD',
      label: 'Philippines',
      flag: '🇵🇭',
    },
    {
      language: 'EN',
      country: 'PL',
      pathPrefix: '/en-pl',
      currency: 'PLN',
      label: 'Poland',
      flag: '🇵🇱',
    },
    {
      language: 'EN',
      country: 'PT',
      pathPrefix: '/en-pt',
      currency: 'EUR',
      label: 'Portugal',
      flag: '🇵🇹',
    },
    {
      language: 'EN',
      country: 'QA',
      pathPrefix: '/en-qa',
      currency: 'USD',
      label: 'Qatar',
      flag: '🇶🇦',
    },
    {
      language: 'EN',
      country: 'SA',
      pathPrefix: '/en-sa',
      currency: 'USD',
      label: 'Saudi Arabia',
      flag: '🇸🇦',
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
      country: 'SK',
      pathPrefix: '/en-sk',
      currency: 'EUR',
      label: 'Slovakia',
      flag: '🇸🇰',
    },
    {
      language: 'EN',
      country: 'SI',
      pathPrefix: '/en-si',
      currency: 'EUR',
      label: 'Slovenia',
      flag: '🇸🇮',
    },
    {
      language: 'EN',
      country: 'ZA',
      pathPrefix: '/en-za',
      currency: 'USD',
      label: 'South Africa',
      flag: '🇿🇦',
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
      country: 'ES',
      pathPrefix: '/en-es',
      currency: 'EUR',
      label: 'Spain',
      flag: '🇪🇸',
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
      country: 'CH',
      pathPrefix: '/en-ch',
      currency: 'CHF',
      label: 'Switzerland',
      flag: '🇨🇭',
    },
    {
      language: 'EN',
      country: 'TW',
      pathPrefix: '/en-tw',
      currency: 'USD',
      label: 'Taiwan',
      flag: '🇹🇼',
    },
    {
      language: 'EN',
      country: 'TH',
      pathPrefix: '/en-th',
      currency: 'USD',
      label: 'Thailand',
      flag: '🇹🇭',
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
      country: 'VA',
      pathPrefix: '/en-va',
      currency: 'USD',
      label: 'Vatican City',
      flag: '🇻🇦',
    },
    {
      language: 'EN',
      country: 'VN',
      pathPrefix: '/en-vn',
      currency: 'USD',
      label: 'Vietnam',
      flag: '🇻🇳',
    },
  ];
}
