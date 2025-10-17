import {Await, useLocation} from 'react-router';
import clsx from 'clsx';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {CartMain, CartCheckout} from '~/components/CartMain';
import {useLocale} from '~/hooks/useLocale';

import {Suspense} from 'react';
import {useDebug} from '~/contexts/DebugContext';

interface PageLayoutProps {
  cart: CartApiQueryFragment | null;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const location = useLocation();
  const collectionPage = location.pathname.includes('/collections/');
  const isPage = location.pathname.includes('/pages/');

  // Get the current locale using our custom hook
  const {currentLocale} = useLocale();

  // Get debug context
  const {commentsEnabled, toggleComments} = useDebug();

  // Full screen if collection page or content page
  const cartPage = collectionPage || isPage;

  return (
    <Suspense
      fallback={
        <div className="flex flex-wrap">
          <main
            className={clsx('w-full 800:min-h-screen bg-gray-100 relative', {
              '800:w-full': cartPage,
              '800:w-2/3': !cartPage,
            })}
          >
            {children}
          </main>

          <div className={clsx('w-full flex flex-col sticky z-30 bottom-0')}>
            {header && (
              <Header
                header={header}
                isLoggedIn={isLoggedIn}
                publicStoreDomain={publicStoreDomain}
              >
                <CartLoading />
              </Header>
            )}
          </div>
        </div>
      }
    >
      <Await resolve={cart}>
        {(cart) => (
          <div className="font-mono">
            {/* Debug Toggle Button - Only shows when comments are enabled */}
            {commentsEnabled && (
              <button
                onClick={toggleComments}
                className="fixed top-4 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                title="Disable Debug Comments"
              >
                🐛 Disable Debug
              </button>
            )}

            <div className="flex flex-wrap">
              <main
                className={clsx(
                  'w-full 800:min-h-screen bg-gray-100 relative',
                  {
                    '800:w-full': cartPage,
                    '800:w-2/3': !cartPage,
                  },
                )}
              >
                {children}
              </main>

              <div
                className={clsx('w-full flex flex-col sticky z-30 bottom-0')}
              >
                {header && (
                  <Header
                    header={header}
                    cart={cart}
                    isLoggedIn={isLoggedIn}
                    publicStoreDomain={publicStoreDomain}
                  >
                    <CartBlock cart={cart} />
                  </Header>
                )}
              </div>
            </div>
            <div className="relative z-20">
              <Footer
                footer={footer}
                header={header}
                publicStoreDomain={publicStoreDomain}
                currentLocale={currentLocale}
              />
            </div>
          </div>
        )}
      </Await>
    </Suspense>
  );
}

function CartLoading() {
  return <CartMain cart={null} layout="aside" />;
}

function CartBlock({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <>
      <CartMain cart={cart} layout="aside" />
      <CartCheckout cart={cart} />
    </>
  );
}
