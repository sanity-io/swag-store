import {type MetaFunction, useLoaderData} from 'react-router';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {
  data,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HeadersFunction,
} from 'react-router';
import {CartMain} from '~/components/CartMain';
import {CART_QUERY_ROUTE} from '~/lib/fragments';

export const meta: MetaFunction = () => {
  return [{title: `Hydrogen | Cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  // Use the cart result directly from the action
  let updatedCartData = cartResult;

  return data(
    {
      cart: updatedCartData,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const {cart, storefront} = context;

  // Get cart data with currency context using storefront client (like products do)
  let cartData = null;
  try {
    const cartId = await cart.getCartId();
    if (cartId) {
      console.log('Fetching cart with currency context:', {
        cartId,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      });

      // First, update the cart's buyer identity to match the current market
      try {
        await cart.updateBuyerIdentity({
          countryCode: storefront.i18n.country,
        });
        console.log('Updated cart buyer identity to:', storefront.i18n.country);
      } catch (updateError) {
        console.log('Could not update cart buyer identity:', updateError);
      }

      const result = await storefront.query(CART_QUERY_ROUTE, {
        variables: {
          cartId,
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
      });
      cartData = result.cart;
      console.log('Cart data fetched:', cartData?.cost?.subtotalAmount);
    }
  } catch (error) {
    console.error('Error fetching cart with currency context:', error);
    // Fallback to regular cart.get() if currency context fails
    cartData = await cart.get();
  }

  return cartData || null;
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="cart">
      <h1>Cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
