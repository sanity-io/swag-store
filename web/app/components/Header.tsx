import {Suspense} from 'react';
import {Await, useAsyncValue} from 'react-router';
import {LocalizedLink, LocalizedNavLink} from './LocalizedLink';
import {CartMain} from './CartMain';
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
  children?: React.ReactNode;
}

const SanityTextLogo = () => {
  return (
    <svg width="70" height="26" viewBox="0 0 70 26" fill="none">
      <g clip-path="url(#clip0_565_3490)">
        <path
          d="M7.19902 9.32063C5.37583 7.94521 3.53018 6.88052 3.53018 5.3278C3.53018 4.39654 4.35244 3.44289 5.48714 3.44289C7.53298 3.44289 8.73316 5.57228 9.91183 8.23354H10.6452V2.11133H5.53111C1.30661 2.11133 0.0615234 4.66248 0.0615234 6.65843C0.0615234 9.27584 2.21868 10.8286 4.66395 12.6472C6.37582 13.9116 7.8211 15.0873 7.8211 16.4404C7.8211 17.9044 6.82016 18.747 5.55263 18.747C4.19622 18.747 2.19529 16.9722 0.793982 13.2911H0.0615234V20.0786H5.90997C9.51239 20.0786 11.3131 17.2391 11.3796 14.9548C11.4684 12.2936 9.17844 10.8071 7.19902 9.32063Z"
          fill="#0B0B0B"
        />
        <path
          d="M23.1208 17.971V10.8065C23.1208 7.70107 21.1862 6.88086 18.3846 6.88086H13.4033L13.4257 11.9384H14.248C15.1152 9.7866 16.3603 8.21242 17.6942 8.21242C18.8504 8.21242 19.3621 9.21087 19.3621 10.2532V11.2292C17.494 12.3387 12.5137 13.2699 12.5137 16.6413C12.5137 18.5934 13.8701 20.2124 15.8495 20.2124C17.5614 20.2124 18.74 19.1029 19.3406 17.7947C19.4519 18.8817 20.1629 20.0789 21.7868 20.0789H24.3443V19.1029C23.5221 19.1029 23.1217 18.5486 23.1217 17.972L23.1208 17.971ZM19.2957 16.8615C18.9402 17.372 18.3836 17.9486 17.7167 17.9486C16.7831 17.9486 16.1825 17.2385 16.1825 15.8192C16.1825 14.2003 18.3612 13.158 19.2957 12.3816V16.8625V16.8615Z"
          fill="#0B0B0B"
        />
        <path
          d="M43.0214 5.50518C44.4442 5.50518 45.3338 4.50674 45.3338 3.2209C45.3338 1.93505 44.4442 0.980469 43.0214 0.980469C41.5986 0.980469 40.6865 1.93412 40.6865 3.2209C40.6865 4.50767 41.6426 5.50518 43.0214 5.50518Z"
          fill="#0B0B0B"
        />
        <path
          d="M65.1235 6.88138V7.85742C66.5248 7.85742 66.9243 8.58899 66.2358 10.5635L64.5679 15.0658L62.4332 9.58743C61.9439 8.52274 62.2105 7.85742 63.2339 7.85742V6.88138H52.6277V2.44531H51.6268C51.3378 3.95324 49.7587 6.88138 47.0684 6.88138V7.85742H48.8027V16.974C48.8027 18.5043 49.3144 20.2344 52.2938 20.2344H56.9187V15.2216H56.0964C55.7624 16.3974 55.074 18.7479 53.5838 18.7479C52.7615 18.7479 52.6277 17.8381 52.6277 17.1065V8.27826H56.8747C57.3864 8.27826 57.9196 8.34451 58.1862 8.96597L62.6998 20.1009C61.8326 22.0754 60.3424 22.3852 57.6745 21.565V25.4692C58.3639 25.4692 60.1422 25.4916 60.4537 25.4029C62.2105 24.8925 63.4107 21.4549 63.8999 20.1242L67.7241 9.81045C68.1469 8.6795 68.5024 7.85836 69.2358 7.85836V6.88231H65.1226L65.1235 6.88138Z"
          fill="#0B0B0B"
        />
        <path
          d="M37.8619 17.9703V10.4064C37.8619 8.03349 36.7281 6.61328 34.4821 6.61328C32.5036 6.61328 31.3577 7.98217 30.4793 9.25588V6.87922H25.4092V7.85527C26.2763 7.85527 26.6543 8.38715 26.6543 9.00861V17.9694C26.6543 18.5684 26.2099 19.1003 25.4092 19.1003V20.0764H31.7244V19.1003C30.9237 19.1003 30.4793 18.5684 30.4793 17.9694V10.4652C30.992 9.7859 31.5822 9.0534 32.5691 9.0534C33.5027 9.0534 34.0369 9.80736 34.0369 10.7172V17.9703C34.0369 18.5694 33.5925 19.1013 32.7918 19.1013V20.0773H39.107V19.1013C38.3063 19.1013 37.8619 18.5694 37.8619 17.9703Z"
          fill="#0B0B0B"
        />
        <path
          d="M45.245 17.971V6.88086H40.1748V7.85691C41.042 7.85691 41.4199 8.38879 41.4199 9.01024V17.971C41.4199 18.5701 40.9756 19.102 40.1748 19.102V20.078H46.49V19.102C45.6893 19.102 45.245 18.5701 45.245 17.971Z"
          fill="#0B0B0B"
        />
      </g>
      <defs>
        <clipPath id="clip0_565_3490">
          <rect
            width="69.1757"
            height="24.4898"
            fill="white"
            transform="translate(0.0615234 0.980469)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const SanitySquiggle = () => {
  return (
    <svg width="31" height="26" viewBox="0 0 31 26" fill="none">
      <g clip-path="url(#clip0_565_3389)">
        <path
          d="M29.8218 17.0631L28.6996 15.1104L23.2716 18.4163L29.3004 10.7406L30.2119 10.2058L29.9864 9.86699L30.4005 9.33789L28.4981 7.75441L27.6273 8.86399L10.0509 19.1471L16.5494 11.3325L28.6534 4.69782L27.5034 2.47485L20.9107 6.08718L24.1571 2.18556L22.2973 0.546875L14.9908 9.33218L7.73436 13.3118L13.29 5.96727L16.7712 4.1554L15.6657 1.90768L5.52322 7.18724L8.289 3.52733L6.35702 1.98001L0.518555 9.70712L0.609145 9.77944L1.69993 12.0005L8.17253 8.62989L2.27305 16.4274L3.23997 17.202L3.81494 18.3135L10.6296 14.5775L3.12534 23.6026L4.98522 25.2413L5.35868 24.7921L23.462 14.1664L17.4516 21.8212L17.5496 21.903L17.5403 21.9087L18.7864 24.0765L26.7806 19.2061L23.7023 24.1736L25.7656 25.5268L30.6667 17.6188L29.8218 17.0631Z"
          fill="#0B0B0B"
        />
      </g>
      <defs>
        <clipPath id="clip0_565_3389">
          <rect
            width="30.1481"
            height="24.9799"
            fill="white"
            transform="translate(0.518555 0.546875)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

type Viewport = 'desktop' | 'mobile';

export function Header({header, children, publicStoreDomain}: HeaderProps) {
  const {shop, menu} = header;

  const {pathname, search} =
    typeof window !== 'undefined'
      ? window.location
      : {pathname: '', search: ''};
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(search)
      : new URLSearchParams();
  const grid = searchParams.get('grid');

  // console.log(pathname, grid);

  return (
    <>
      <header
        className={clsx(
          'sticky bottom-0 order-2 800:order-1 left-0 w-full 800:w-2/3 z-30 bg-white h-[40px] flex flex-wrap justify-between items-center',
          pathname.includes('/collections/all') && 'h-[80px]',
        )}
      >
        {pathname.includes('/collections/all') && (
          <div className="w-full  h-[40px] flex items-center justify-center">
            <LocalizedLink
              to="/collections/all"
              className={clsx(
                'w-full text-center inline-flex h-full justify-center items-center font-bold',
                grid !== 'true' ? 'bg-brand-blue' : 'bg-brand-blue/50',
              )}
            >
              Catalogue
            </LocalizedLink>
            <LocalizedLink
              to="/collections/all?grid=true"
              className={clsx(
                'w-full text-center inline-flex h-full justify-center items-center font-bold',
                grid === 'true' ? 'bg-brand-blue' : 'bg-brand-blue/50',
              )}
            >
              Grid View
            </LocalizedLink>
          </div>
        )}
        <div className="w-full justify-between h-[40px] flex items-center">
          <LocalizedNavLink
            className="p-0 h-full inline-flex justify-between items-center"
            to="/"
          >
            <span className="800:bg-brand-orange 800:min-w-[180px] px-2 inline-flex items-center justify-center h-full">
              <SanityTextLogo />
            </span>
            <div
              className="h-full inline-flex items-center justify-center p-2"
              style={{
                backgroundImage: 'url(/images/grid-bg.png)',
                backgroundSize: '5px',
                backgroundRepeat: 'repeat',
              }}
            >
              <SanitySquiggle />
            </div>
            <span className="bg-black hidden  text-white px-8 800:inline-flex items-center justify-center h-full">
              Components&reg;
            </span>
          </LocalizedNavLink>
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
          {/* <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
        </div>
      </header>
      {children}
    </>
  );
}

export function HeaderMenu({
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
        <LocalizedNavLink to="/">Home</LocalizedNavLink>
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
          <LocalizedNavLink className="header-menu-item" key={item.id} to={url}>
            {item.title}
          </LocalizedNavLink>
        );
      })}
    </nav>
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
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
