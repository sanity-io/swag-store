import {type LoaderFunctionArgs} from 'react-router';
import {useLoaderData, type MetaFunction, useLocation} from 'react-router';
import {useEffect} from 'react';
import {LocalizedLink} from '~/components/LocalizedLink';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';

import {Arrow} from '~/components/Icons';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.policy.title ?? ''}`}];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
      country: context.storefront.i18n?.country,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();
  const location = useLocation();

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    const scrollToTop = () => {
      // Try multiple methods
      window.scrollTo(0, 0);
      window.scrollTo({top: 0, left: 0, behavior: 'instant'});
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Try scrolling the main element if it exists
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }

      // Try scrolling the root element
      const rootElement = document.querySelector('#root');
      if (rootElement) {
        rootElement.scrollTop = 0;
      }
    };

    // Try immediately and after delays
    scrollToTop();
    setTimeout(scrollToTop, 100);
  }, [location.pathname]); // Re-run when pathname changes

  return (
    <div className="bg-black text-white">
      <div>
        <LocalizedLink
          to="/"
          className="fixed text-white top-4 w-[80px] h-[80px] z-20 left-4"
        >
          <Arrow />
        </LocalizedLink>
      </div>
      <div className="shopify-text pt-40 p-4">
        <h1 className="font-sans my-4 text-18 800:text-30">{policy.title}</h1>
        <div dangerouslySetInnerHTML={{__html: policy.body}} />
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
