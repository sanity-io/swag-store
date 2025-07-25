import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from 'react-router';

import PageComponentList from '~/components/PageComponentList';

import {HOME_PAGE_QUERY, NESTED_HOME_PRODUCTS_QUERY} from '~/groq/queries';

import {SANITY_SHOPIFY_PRODUCTS} from '~/graphql/ProductQuery';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // Our home page is a reference to a settings singleton document
  const {data} = await context.sanity.loadQuery(HOME_PAGE_QUERY);

  // We fetch specific product GIDs for the homepage
  const {
    data: {products},
  } = await context.sanity.loadQuery(NESTED_HOME_PRODUCTS_QUERY);

  const productIds = products
    .map(({product}) => product.map((p) => p.productId))
    .flat();
  const uniqueProductIds = [...new Set(productIds)];
  console.log('uniqueProductIds', uniqueProductIds);
  let deferredData = {};
  if (uniqueProductIds.length > 0) {
    deferredData = await context.storefront.query(SANITY_SHOPIFY_PRODUCTS, {
      variables: {
        ids: uniqueProductIds,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    });
  }

  return {
    featuredCollection: collections.nodes[0],
    sanityData: data,
    productData: deferredData,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const modules = data.sanityData?.modules;
  console.log('data', data);
  return (
    <div className="home bg-gray-100">
      <PageComponentList components={modules} />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
