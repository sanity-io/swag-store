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

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  // Our home page is a reference to a settings singleton document
  const {data} = await context.sanity.loadQuery(HOME_PAGE_QUERY);

  // We fetch specific product GIDs for the homepage
  const productData = await context.sanity.loadQuery(
    NESTED_HOME_PRODUCTS_QUERY,
  );

  console.log('productData', productData.data);

  if (!productData.data) {
    throw new Response(
      'Product data not found or missing a homepage configuration in the sanity studio',
      {
        status: 404,
        statusText: 'Not Found',
      },
    );
  }

  const productIds = productData.data.products
    ?.map(({product}) => product.map((p) => p.productId))
    .flat();
  const uniqueProductIds = [...new Set(productIds)];

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
    sanityData: data,
    productData: deferredData,
  };
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const modules = data.sanityData?.modules;

  return (
    <div className="home bg-gray-100">
      <PageComponentList components={modules} />
    </div>
  );
}
