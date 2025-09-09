import {Money} from '@shopify/hydrogen';
import {useLocale} from '~/hooks/useLocale';

interface LocalizedMoneyProps {
  data: {
    amount?: string;
    currencyCode?: string;
  };
}

/**
 * A localized Money component that ensures the correct currency is displayed
 * based on the current locale context.
 */
export function LocalizedMoney({data}: LocalizedMoneyProps) {
  const {currentLocale} = useLocale();

  // Ensure we have valid data
  if (!data || !data.amount) {
    return <Money data={data} />;
  }

  // If we have a current locale, use its currency code
  if (currentLocale && currentLocale.currency) {
    const localizedData = {
      ...data,
      currencyCode: currentLocale.currency,
    };
    return <Money data={localizedData} />;
  }

  // Fallback to the original data
  return <Money data={data} />;
}
