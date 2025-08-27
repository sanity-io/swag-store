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
  console.log('cart', cart?.lines?.nodes);
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
          'p-2 h-[40px] w-full hidden 800:flex cursor-pointer justify-between items-center bg-brand-yellow',
          // {
          //   '800:!hidden': !collapsed,
          // },
        )}
        onClick={() => setIsCollapsed(!collapsed)}
      >
        <div className="">
          <span>
            Cart
            {/* {isCollapsedMobile ? 'true' : 'false'} */}
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
          Cart
          {/* <span>mobile ism: {isCollapsedMobile ? 'true' : 'false'}</span> */}
          {/* <span>({cart?.totalQuantity ?? 0})</span> */}
        </div>
        +
      </button>
      <div
        className={clsx('p-4 h-full hidden 800:flex flex-col gap-4', {
          '800:!hidden ': collapsed,
          '!h-[calc(100%-40px)]': !collapsed,
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
              className="w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
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
              className="w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
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
              className="w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
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
              className="w-full h-full hover:border-black border border-transparent inline-flex items-center justify-center"
            >
              Select goods
            </LocalizedLink>
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
