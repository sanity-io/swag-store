import {useLocation} from 'react-router';
import {SUPPORTED_LOCALES, getLocaleFromRequest} from '~/lib/i18n';

export function useLocale() {
  const location = useLocation();
  
  // Get the current locale from the URL path
  const currentLocale = getLocaleFromRequest(new Request(`https://example.com${location.pathname}`));
  
  // Find the full locale object from our supported locales
  const fullLocale = SUPPORTED_LOCALES.find(
    (locale) =>
      locale.language === currentLocale?.language &&
      locale.country === currentLocale?.country
  ) || SUPPORTED_LOCALES[0];

  // Ensure we always return a valid locale object
  if (!fullLocale) {
    console.warn('useLocale: No valid locale found, using default');
    return {
      currentLocale: SUPPORTED_LOCALES[0],
      isDefaultLocale: true,
      switchLocale: (newLocale: typeof SUPPORTED_LOCALES[0]) => newLocale,
    };
  }

  return {
    currentLocale: fullLocale,
    isDefaultLocale: fullLocale.pathPrefix === '',
    switchLocale: (newLocale: typeof fullLocale) => {
      // This will be handled by the CountrySelector component
      // but we can expose it here for other components that need it
      return newLocale;
    },
  };
}
