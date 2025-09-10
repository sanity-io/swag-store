import {Money} from '@shopify/hydrogen';

interface LocalizedMoneyProps {
  data: {
    amount?: string;
    currencyCode?: string;
  };
}

/**
 * A localized Money component that ensures the correct currency is displayed
 * based on the current locale context.
 *
 * The cart data should now be properly localized through the @inContext directive
 * in the cart query, so this component just renders the Money component directly.
 */
export function LocalizedMoney({data}: LocalizedMoneyProps) {
  // Ensure we have valid data
  if (!data || !data.amount) {
    return <Money data={data} />;
  }

  // The cart data should now be properly localized through the @inContext directive
  // in the cart query, so we can just use the original Money component
  return <Money data={data} />;
}
