import {useOptimisticCart, Money} from '@shopify/hydrogen';
import {LocalizedLink} from './LocalizedLink';
import {useLocation} from 'react-router';
import {useEffect, useState} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import clsx from 'clsx';
import {CartForm} from '@shopify/hydrogen';
import {useCartFetchers} from '~/hooks/useCartFetchers';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  // collectionPage: boolean;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartCheckout({cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);
  return (
    <div
      key="CART_BUTTON"
      aria-labelledby="cart-summary"
      className="w-full h-[40px] group order-0 800:absolute bottom-0 z-20 bg-black flex justify-between items-center 800:justify-end"
    >
      <a
        href={originalCart?.checkoutUrl}
        className="w-full 800:w-1/3 flex justify-between items-center"
      >
        <div className="bg-black text-white md:group-hover:text-brand-yellow  py-2 inline-flex w-1/2 px-[20px]">
          Total ({cart?.totalQuantity ?? 0}):&nbsp;
          <dd>
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart?.cost?.subtotalAmount} />
            ) : (
              '$0'
            )}
          </dd>
        </div>
        <span className="bg-black text-white text-right md:group-hover:text-brand-yellow font-sans font-bold capitalize text-16 py-2 w-1/2 px-[20px]">
          checkout
        </span>
      </a>
    </div>
  );
}

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({
  layout,
  cart: originalCart,
  // collectionPage,
}: CartMainProps) {
  // Handle Cart open/close on navigation
  const location = useLocation();
  const collectionPage = location.pathname.includes('/collections/');
  const isPage = location.pathname.includes('/pages/');

  const cartPage = collectionPage || isPage;

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  const [isCollapsableDesktop, setIsCollapsableDesktop] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collectionPage || false);
  const [isCollapsedMobile, setIsCollapsedMobile] = useState(true);
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main min-h-[40px] relative flex duration-300 transition-all ease-in-out flex-col justify-between ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  useEffect(() => {
    if (location.pathname.includes('/collections/') || isPage) {
      setIsCollapsed(true);
      setIsCollapsableDesktop(true);
    } else {
      setIsCollapsed(false);
      setIsCollapsableDesktop(false);
    }
    setIsCollapsedMobile(true);
  }, [location]);

  useEffect(() => {
    if (addToCartFetchers.length > 0) {
      setIsCollapsed(false);
    }
  }, [addToCartFetchers]);

  return (
    <div
      key="CART"
      style={{
        backgroundImage: 'url(/images/grid-bg.png)',
        backgroundSize: '5px',
        backgroundRepeat: 'repeat',
      }}
      className={clsx(
        'w-full overflow-hidden 800:w-1/3 800:absolute order-0 800:order-2 right-0 duration-300 transition-all ease-in-out bottom-0 min-h-[40px] h-[40px] 800:h-[80px] 800:min-h-[80px] block bg-brand-yellow',
        {
          '800:h-[calc(100dvh-40px)] 800:h-dvh': !isCollapsed,
          'h-[calc(100dvh-80px)] z-[1000]': !isCollapsedMobile,
          // '800:absolute bottom-0': cartPage,
          // '800:sticky top-0': !cartPage,
        },
      )}
    >
      <div
        className={clsx(className, {
          '800:h-dvh 800:min-h-full': !isCollapsed,
          'h-[calc(100dvh-40px)] min-h-full': !isCollapsedMobile,
        })}
      >
        <div
          className={clsx('cart-details')}
          style={{
            height: `calc(100% - 40px)`,
          }}
          aria-labelledby="cart-lines"
        >
          <CartLines
            cart={originalCart}
            layout={layout}
            collapsed={isCollapsed}
            isCollapsableDesktop={isCollapsableDesktop}
            isCollapsedMobile={isCollapsedMobile}
            setIsCollapsedMobile={setIsCollapsedMobile}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
      </div>
    </div>
  );
}

function CartLines({
  cart,
  layout,
  collapsed,
  isCollapsableDesktop,
  isCollapsedMobile,
  setIsCollapsed,
  setIsCollapsedMobile,
}: {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  collapsed: boolean;
  isCollapsableDesktop: boolean;
  isCollapsedMobile: boolean;
  setIsCollapsedMobile: (collapsed: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
}) {
  const hats =
    cart?.lines?.nodes.filter((line) =>
      line.attributes.some(
        (attribute) =>
          attribute.key === 'category' && attribute.value === 'hats',
      ),
    ) || [];
  const clothing =
    cart?.lines?.nodes.filter((line) =>
      line.attributes.some(
        (attribute) =>
          attribute.key === 'category' && attribute.value === 'clothing',
      ),
    ) || [];
  const accessories =
    cart?.lines?.nodes.filter((line) =>
      line.attributes.some(
        (attribute) =>
          attribute.key === 'category' && attribute.value === 'accessories',
      ),
    ) || [];
  const goods =
    cart?.lines?.nodes.filter((line) =>
      line.attributes.some(
        (attribute) =>
          attribute.key === 'category' && attribute.value === 'goods',
      ),
    ) || [];

  return (
    <>
      <button
        className={clsx(
          'p-2 px-[20px] h-[40px] w-full hidden 800:flex cursor-pointer justify-between items-center bg-brand-yellow',
          {
            '!hidden': !isCollapsableDesktop,
          },
        )}
        onClick={() => isCollapsableDesktop && setIsCollapsed(!collapsed)}
      >
        <div className="">
          <span>Cart</span>
          <span>({cart?.totalQuantity ?? 0})</span>
        </div>
        {isCollapsableDesktop ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={clsx('transition-transform duration-300 transform', {
              'rotate-45': !collapsed,
            })}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_565_3294)">
              <path
                d="M21.5459 11.9991H2.45406"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 21.545V2.45312"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_565_3294">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        ) : (
          ''
        )}
      </button>
      <button
        className={clsx(
          'p-2 h-[40px] w-full flex 800:hidden cursor-pointer justify-between items-center bg-brand-yellow',
        )}
        onClick={() => setIsCollapsedMobile(!isCollapsedMobile)}
      >
        <div className="">Cart</div>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className={clsx('transition-transform duration-300 transform', {
            'rotate-45': !isCollapsedMobile,
          })}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_565_3294)">
            <path
              d="M21.5459 11.9991H2.45406"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 21.545V2.45312"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_565_3294">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>
      <div
        className={clsx('p-[20px] h-full hidden 800:flex flex-col gap-4', {
          '800:!hidden ': collapsed,
          '!h-[calc(100%-0px)]': !collapsed && !isCollapsableDesktop,
          '!h-[calc(100%-40px)]': !collapsed && isCollapsableDesktop,
          '!flex !h-[calc(100%-40px)]': !isCollapsedMobile,
        })}
      >
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-start items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 px-1 z-10 text-white bg-black uppercase">
            hats ({hats?.length ?? 0})
          </div>
          {hats?.length > 0 ? (
            <ul className="relative flex flex-row h-full overflow-x-scroll gap-2">
              {hats?.map((hat) => (
                <CartLineItem key={hat.id} line={hat} />
              ))}
            </ul>
          ) : (
            <LocalizedLink
              to="/collections/all?category=hats"
              className="uppercase w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select hats
            </LocalizedLink>
          )}
        </div>
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-start items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 px-1 z-10 text-white bg-black uppercase">
            clothing ({clothing?.length ?? 0})
          </div>
          {clothing?.length > 0 ? (
            <ul className="relative flex flex-row h-full overflow-x-scroll gap-2">
              {clothing?.map((clothing) => (
                <CartLineItem key={clothing.id} line={clothing} />
              ))}
            </ul>
          ) : (
            <LocalizedLink
              to="/collections/all?category=clothing"
              className="uppercase w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select clothing
            </LocalizedLink>
          )}
        </div>
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-start items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 px-1 z-10 text-white bg-black uppercase">
            accessories ({accessories?.length ?? 0})
          </div>
          {accessories?.length > 0 ? (
            <ul className="relative flex flex-row h-full overflow-x-scroll gap-2">
              {accessories?.map((accessory) => (
                <CartLineItem key={accessory.id} line={accessory} />
              ))}
            </ul>
          ) : (
            <LocalizedLink
              to="/collections/all?category=accessories"
              className="uppercase w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select accessories
            </LocalizedLink>
          )}
        </div>

        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-start items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 px-1 z-10 text-white bg-black uppercase">
            goods ({goods?.length ?? 0})
          </div>
          {goods?.length > 0 ? (
            <ul className="relative flex flex-row h-full overflow-x-scroll gap-2">
              {goods?.map((good) => (
                <CartLineItem key={good.id} line={good} />
              ))}
            </ul>
          ) : (
            <LocalizedLink
              to="/collections/all?category=goods"
              className="uppercase w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select goods
            </LocalizedLink>
          )}
        </div>
      </div>
    </>
  );
}
