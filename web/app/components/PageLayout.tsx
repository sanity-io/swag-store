import {Await, Link, useLocation} from 'react-router';
import {Suspense, useId} from 'react';
import clsx from 'clsx';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
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

  // Full screen if collection page or content page
  const cartPage = collectionPage || isPage;

  return (
    <div className="font-mono">
      {/* <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} /> */}

      <div className="flex flex-wrap">
        <main
          className={clsx('w-full relative', {
            '800:w-full': cartPage,
            '800:w-2/3': !cartPage,
          })}
        >
          {children}
        </main>

        <div
          className={clsx('w-full flex flex-col sticky z-30 bottom-0', {
            // '800:w-full': !cartPage,
            // '800:w-2/3': cartPage,
          })}
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
        />
      </div>
    </div>
  );
}

function CartBlock({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <>
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </>
  );
}
