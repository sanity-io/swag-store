import {useOptimisticCart, Money} from '@shopify/hydrogen';
import {Link, useLocation} from 'react-router';
import {useEffect, useState} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartLineItem, CartLineSimple} from '~/components/CartLineItem';
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

  const [isCollapsed, setIsCollapsed] = useState(collectionPage || false);
  const [isCollapsedMobile, setIsCollapsedMobile] = useState(true);
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main min-h-[80px] relative flex duration-300 transition-all ease-in-out flex-col justify-between ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  useEffect(() => {
    if (location.pathname.includes('/collections/') || isPage) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
    setIsCollapsedMobile(true);
  }, [location]);

  useEffect(() => {
    if (addToCartFetchers.length > 0) {
      setIsCollapsed(false);
      console.log('addToCartFetchers', addToCartFetchers);
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
        'w-full 800:w-1/3 800:absolute order-1 800:order-2 right-0 duration-300 transition-all ease-in-out bottom-0 min-h-[80px] h-[80px] block bg-brand-yellow',
        {
          '800:h-[calc(100dvh-40px)] 800:h-dvh': !isCollapsed,
          'h-[calc(100dvh-40px)] z-[1000]': !isCollapsedMobile,
          // '800:absolute bottom-0': cartPage,
          // '800:sticky top-0': !cartPage,
        },
      )}
    >
      <div
        className={clsx(className, {
          '800:h-dvh 800:min-h-full': !isCollapsed,
          'h-[calc(100dvh-0px)] min-h-full': !isCollapsedMobile,
        })}
      >
        {/* <CartEmpty
          hidden={linesCount}
          collapsed={isCollapsed}
          layout={layout}
          setIsCollapsed={setIsCollapsed}
        /> */}
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
            isCollapsedMobile={isCollapsedMobile}
            setIsCollapsedMobile={setIsCollapsedMobile}
            setIsCollapsed={setIsCollapsed}
          />
          {/* {cartHasItems && <CartSummary cart={cart} layout={layout} />} */}
        </div>
        <div
          aria-labelledby="cart-summary"
          className="w-full h-[40px] absolute bottom-0 bg-black flex justify-between items-center"
        >
          <div className="bg-black text-white px-4 py-2 inline-flex w-1/2">
            Total({cart?.totalQuantity}):&nbsp;
            <dd>
              {cart?.cost?.subtotalAmount?.amount ? (
                <Money data={cart?.cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </dd>
          </div>
          <a
            href={originalCart?.checkoutUrl}
            className="bg-black !text-white text-right font-sans font-bold capitalize text-16 px-4 py-2 w-1/2"
          >
            checkout
          </a>
        </div>
      </div>
    </div>
  );
}

function CartLines({
  cart,
  layout,
  collapsed,
  isCollapsedMobile,
  setIsCollapsed,
  setIsCollapsedMobile,
}: {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  collapsed: boolean;
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
  const shirts =
    cart?.lines?.nodes.filter((line) =>
      line.attributes.some(
        (attribute) =>
          attribute.key === 'category' && attribute.value === 'shirts',
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
          'p-2 h-[40px] w-full hidden 800:flex cursor-pointer justify-between items-center bg-brand-yellow',
          {
            '800:!hidden': collapsed,
          },
        )}
        onClick={() => setIsCollapsed(!collapsed)}
      >
        <div className="">
          <span>
            DESKTOP is d: {collapsed ? 'true' : 'false'} m:{' '}
            {isCollapsedMobile ? 'true' : 'false'}
          </span>
          <span>({cart?.totalQuantity ?? 0})</span>
        </div>
        +
      </button>
      <button
        className={clsx(
          'p-2 h-[40px] w-full flex 800:hidden cursor-pointer justify-between items-center bg-brand-yellow',
          {
            // hidden: !isCollapsedMobile,
          },
        )}
        onClick={() => setIsCollapsedMobile(!isCollapsedMobile)}
      >
        <div className="">
          <span>mobile ism: {isCollapsedMobile ? 'true' : 'false'}</span>
          <span>({cart?.totalQuantity ?? 0})</span>
        </div>
        +
      </button>
      <div
        className={clsx('p-4 h-full hidden 800:flex flex-col gap-4', {
          '800:!hidden': collapsed,
          '!flex !h-[calc(100%-40px)]': !isCollapsedMobile,
        })}
      >
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-start items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 px-1 z-10 text-white bg-black">
            hats ({hats?.length ?? 0})
          </div>
          {hats?.length > 0 ? (
            <ul className="relative flex flex-row h-full">
              {hats?.map((hat) => (
                <CartLineSimple key={hat.id} line={hat} />
              ))}
            </ul>
          ) : (
            <Link
              to="/collections/all?category=hats"
              className="w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select hats
            </Link>
          )}
        </div>
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-start items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 px-1 z-10 text-white bg-black">
            shirts ({shirts?.length ?? 0})
          </div>
          {shirts?.length > 0 ? (
            <ul className="relative flex flex-row h-full">
              {shirts?.map((shirt) => (
                <CartLineSimple key={shirt.id} line={shirt} />
              ))}
            </ul>
          ) : (
            <Link
              to="/collections/all?category=shirts"
              className="w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select shirts
            </Link>
          )}
        </div>
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-start items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 px-1 z-10 text-white bg-black">
            accessories ({accessories?.length ?? 0})
          </div>
          {accessories?.length > 0 ? (
            <ul className="relative flex flex-row h-full">
              {accessories?.map((accessory) => (
                <CartLineSimple key={accessory.id} line={accessory} />
              ))}
            </ul>
          ) : (
            <Link
              to="/collections/all?category=accessories"
              className="w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select accessories
            </Link>
          )}
        </div>

        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-start items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 px-1 z-10 text-white bg-black">
            goods ({goods?.length ?? 0})
          </div>
          {goods?.length > 0 ? (
            <ul className="relative flex flex-row h-full">
              {goods?.map((good) => (
                <CartLineSimple key={good.id} line={good} />
              ))}
            </ul>
          ) : (
            <Link
              to="/collections/all?category=goods"
              className="w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select goods
            </Link>
          )}
        </div>
        {/* <ul className={clsx(' p-4')}>
          {(cart?.lines?.nodes ?? []).map((line) => (
            <CartLineItem key={line.id} line={line} layout={layout} />
          ))}
        </ul> */}
      </div>
    </>
  );
}

function CartEmpty({
  hidden = false,
  collapsed = false,
  setIsCollapsed,
}: {
  hidden: boolean;
  collapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  layout?: CartMainProps['layout'];
}) {
  return (
    <div
      className={clsx({
        hidden: hidden,
      })}
    >
      {collapsed && (
        <button
          className="p-2 h-[40px] bg-brand-yellow"
          onClick={() => setIsCollapsed(false)}
        >
          <div className="">
            <span>goods</span>
            <span>0</span>
          </div>
          +
        </button>
      )}
      <div
        hidden={hidden}
        className={clsx('p-4 h-full flex flex-col gap-4', {
          '800:hidden': collapsed,
        })}
      >
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-center items-center relative">
          <div className="absolute top-0 left-0 px-1 text-white bg-black">
            Hats (0)
          </div>
          Select hats
        </div>
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-center items-center relative">
          <div className="absolute top-0 left-0 px-1 text-white bg-black">
            Shirts (0)
          </div>
          Select shirts
        </div>
        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-center items-center relative">
          <div className="absolute top-0 left-0 px-1 text-white bg-black">
            accessories (0)
          </div>
          Select accessories
        </div>

        <div className="h-1/4 inline-flex bg-brand-yellow w-full justify-center items-center relative">
          <div className="absolute top-0 left-0 px-1 text-white bg-black">
            goods (0)
          </div>
          Select goods
        </div>
      </div>
    </div>
  );
}
