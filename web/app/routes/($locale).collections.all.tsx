import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {GridProductItem, ProductItem} from '~/components/ProductItem';
import clsx from 'clsx';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: `Hydrogen | Products`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  const searchParams = new URLSearchParams(args.request.url.split('?')[1]);
  const grid = searchParams.get('grid');

  return {...deferredData, ...criticalData, grid};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 60,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Collection() {
  const {products, grid} = useLoaderData<typeof loader>();

  return (
    <div className="collection bg-gray-100">
      {!grid && (
        <div className="fixed top-0 left-0 w-full p-4 z-10">
          <div className="flex items-start leading-none flex-wrap gap-2">
            <span className="text-sm relative top-2 inline-block mr-8">
              FILTER
            </span>
            <button className="text-24 800:text-56 mr-6 italic">
              Everything(14)
            </button>
            <button className="text-24 800:text-56 mr-6">Hats(3)</button>
            <button className="text-24 800:text-56 mr-6">Shirts(4)</button>
            <button className="text-24 800:text-56 mr-6">Accessories(4)</button>
            <button className="text-24 800:text-56 mr-6">Goods(1)</button>
          </div>
        </div>
      )}
      {grid && (
        <div className="grid grid-cols-10 text-white gap-0 bg-black">
          <div className="col-span-2 p-2">SKU</div>
          <div className="col-span-1 p-2">Thumbnail</div>
          <div className="col-span-4 p-2">Product</div>
          <div className="col-span-2 p-2">Price</div>
          <div className="col-span-1 p-2"></div>
        </div>
      )}
      <PaginatedResourceSection
        connection={products}
        resourcesClassName={clsx(
          'grid gap-0',
          grid ? 'grid-cols-1' : 'grid-cols-2 800:grid-cols-4 gap-0',
        )}
      >
        {({node: product, index}) => {
          return grid ? (
            <GridProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          ) : (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          );
        }}
      </PaginatedResourceSection>
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
