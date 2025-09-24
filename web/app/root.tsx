import {
  Analytics,
  getShopAnalytics,
  useNonce,
  createHydrogenContext,
} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useLocation,
} from 'react-router';

import {
  FOOTER_QUERY,
  HEADER_QUERY,
  CART_QUERY_FRAGMENT,
  CART_QUERY_ROOT,
} from '~/lib/fragments';
import {getLocaleFromRequest} from '~/lib/i18n';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from '~/styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {useLocale} from './hooks/useLocale';
import {DebugProvider} from './contexts/DebugContext';

import {Sanity} from 'hydrogen-sanity';
import {VisualEditing} from 'hydrogen-sanity/visual-editing';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
  formAction,
}) => {
  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // revalidate when the locale changes (different path prefix) - this is crucial for currency updates
  const currentPath = currentUrl.pathname;
  const nextPath = nextUrl.pathname;
  const currentLocale = currentPath.split('/')[1];
  const nextLocale = nextPath.split('/')[1];

  if (currentLocale !== nextLocale) {
    return true;
  }

  // Only revalidate for specific cart actions, not all form submissions
  if (formAction && formAction.includes('/cart')) {
    return true;
  }

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/png', href: `/images/favicon.png`},
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env, sanity, cache, waitUntil, session} = args.context;

  // Get the current locale from the request URL
  const currentLocale = getLocaleFromRequest(args.request);

  // Create a new hydrogen context with the current locale
  const hydrogenContext = createHydrogenContext({
    env,
    request: args.request,
    cache: cache as Cache,
    waitUntil,
    session,
    i18n: currentLocale,
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  return {
    ...deferredData,
    ...criticalData,
    // cart: cartData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    storefront: {
      i18n: currentLocale,
    },
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: currentLocale.country,
      language: currentLocale.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
        country: storefront.i18n?.country,
        language: storefront.i18n?.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
        country: storefront.i18n?.country,
        language: storefront.i18n?.language,
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  // Get cart data with currency context using storefront client
  const cartData = (async () => {
    try {
      const cartId = await cart.getCartId();
      if (cartId) {
        // First, update the cart's buyer identity to match the current market
        try {
          await cart.updateBuyerIdentity({
            countryCode: storefront.i18n?.country,
          });
        } catch (updateError) {
          console.log('Could not update cart buyer identity:', updateError);
        }

        return cart.get({
          country: storefront.i18n?.country,
          language: storefront.i18n?.language,
        });
      }
      return null;
    } catch (error) {
      console.error('Error fetching cart with currency context:', error);
      // Fallback to regular cart.get() if currency context fails
      return cart.get({
        country: storefront.i18n?.country,
        language: storefront.i18n?.language,
      });
    }
  })();

  return {
    isLoggedIn: customerAccount.isLoggedIn(),
    cart: cartData,
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  // Get the current language for the HTML lang attribute
  const {currentLocale} = useLocale();
  const currentLanguage = currentLocale.language.toLowerCase();

  return (
    <html lang={currentLanguage}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* <link rel="stylesheet" href={resetStyles} /> */}
        <link rel="stylesheet" href={tailwindCss} />
        <link rel="stylesheet" href={appStyles} />
        <Meta />
        <Links />
      </head>
      <body>
        <DebugProvider>
          {data ? (
            <Analytics.Provider
              cart={data.cart}
              shop={data.shop}
              consent={data.consent}
            >
              <PageLayout {...data}>{children}</PageLayout>
            </Analytics.Provider>
          ) : (
            children
          )}
        </DebugProvider>

        <Sanity nonce={nonce} />
        <VisualEditing action="/api/preview" />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <div className="p-4 min-h-[80dvh] flex flex-col justify-center text-center items-center">
        <div>
          <h1>Seems to be an error rendering this page</h1>
          <h2 className="text-56 font-bold">{errorStatus}</h2>
          {errorMessage && (
            <fieldset>
              <pre dangerouslySetInnerHTML={{__html: errorMessage}} />
            </fieldset>
          )}
        </div>
      </div>
    </div>
  );
}
