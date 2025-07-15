import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import clsx from 'clsx';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const searchParams = new URLSearchParams(window.location.search);
  const grid = searchParams.get('grid');

  const {pathname} = window.location;
  console.log(pathname, grid);

  return (
    <header
      className={clsx(
        'fixed bottom-0 left-0 w-full 800:w-2/3 z-30 bg-white h-[40px] flex flex-wrap justify-between items-center',
        pathname.includes('/collections/all') && 'h-[80px]',
      )}
    >
      {pathname.includes('/collections/all') && (
        <div className="w-full  h-[40px] flex items-center justify-center">
          <Link
            className={clsx(
              'w-full text-center inline-flex h-full justify-center items-center font-bold',
              grid !== 'true' ? 'bg-brand-blue' : 'bg-brand-blue/50',
            )}
            to="/collections/all"
          >
            Catalogue
          </Link>
          <Link
            className={clsx(
              'w-full text-center inline-flex h-full justify-center items-center font-bold',
              grid === 'true' ? 'bg-brand-blue' : 'bg-brand-blue/50',
            )}
            to="/collections/all?grid=true"
          >
            Grid
          </Link>
        </div>
      )}
      <div className="w-full justify-between h-[40px] flex items-center">
        <NavLink
          className="p-0 h-full inline-flex justify-between items-center"
          prefetch="intent"
          to="/"
          style={activeLinkStyle}
          end
        >
          <span className="bg-brand-green min-w-[180px] px-2 inline-flex items-center justify-center h-full">
            Sanity
          </span>
          <span className="bg-black text-white px-8 inline-flex items-center justify-center h-full">
            Components&reg;
          </span>
        </NavLink>
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
        {/* <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `gap-6 flex pr-6 header-menu-${viewport}`;

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink end prefetch="intent" style={activeLinkStyle} to="/">
          Information
        </NavLink>
      )}
      {FALLBACK_HEADER_MENU.items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  return (
    <button
      className="header-menu-mobile-toggle reset"
      // onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  // const {open} = useAside();
  return (
    <button className="reset" onClick={() => console.log('search')}>
      Search
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  // const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        // open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections/all',
      items: [],
    },
    // {
    //   id: 'gid://shopify/MenuItem/461609533496',
    //   resourceId: null,
    //   tags: [],
    //   title: 'Blog',
    //   type: 'HTTP',
    //   url: '/blogs/journal',
    //   items: [],
    // },
    // {
    //   id: 'gid://shopify/MenuItem/461609566264',
    //   resourceId: null,
    //   tags: [],
    //   title: 'Policies',
    //   type: 'HTTP',
    //   url: '/policies',
    //   items: [],
    // },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/demo',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
