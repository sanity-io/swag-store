import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {SUPPORTED_LOCALES} from '~/lib/i18n';

export async function loader({params, context}: LoaderFunctionArgs) {
  // Check if the locale parameter is valid
  if (params.locale) {
    const isValidLocale = SUPPORTED_LOCALES.some(
      (locale) => locale.pathPrefix === `/${params.locale}`,
    );

    if (!isValidLocale) {
      // If the locale param is not in our supported locales, send to 404
      throw new Response(null, {status: 404});
    }
  }

  return null;
}
