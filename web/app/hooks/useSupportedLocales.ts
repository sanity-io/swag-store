import {useState, useEffect} from 'react';
import {useLoaderData} from 'react-router';
import {getSupportedLocalesSync, getSupportedLocales, type I18nLocale} from '~/lib/i18n';
import type {Storefront} from '@shopify/hydrogen';

interface AppLoadContext {
  storefront: Storefront;
}

export function useSupportedLocales() {
  const [locales, setLocales] = useState<I18nLocale[]>(() => getSupportedLocalesSync());
  const [isLoading, setIsLoading] = useState(!locales || locales.length <= 20); // Assume fallback if 20 or fewer locales
  const [error, setError] = useState<string | null>(null);

  const data = useLoaderData() as { storefrontClient?: Storefront };
  const storefront = data?.storefrontClient;

  useEffect(() => {
    if (!storefront) {
      console.warn('No storefront available for locale fetching');
      return;
    }

    // If we already have a good set of locales (more than fallback), don't refetch
    if (locales && locales.length > 20) {
      setIsLoading(false);
      return;
    }

    // Fetch locales from API
    getSupportedLocales(storefront)
      .then((fetchedLocales) => {
        setLocales(fetchedLocales);
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('useSupportedLocales: Error fetching locales:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      });
  }, [storefront, locales?.length]);

  return {
    locales,
    isLoading,
    error,
  };
}
