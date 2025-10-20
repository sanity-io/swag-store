import {redirect, type LoaderFunctionArgs} from 'react-router';
import {LocalizedLink} from '~/components/LocalizedLink';
import {useLoaderData, type MetaFunction, useLocation} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {useEffect} from 'react';

import {redirectIfHandleIsLocalized} from '~/lib/redirect';

import {GridProductItem, ProductItem} from '~/components/ProductItem';
import clsx from 'clsx';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Sanity Market | ${data?.collection.title ?? ''} Products`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const searchParams = new URLSearchParams(args.request.url.split('?')[1]);
  const grid = searchParams.get('grid');
  const category = searchParams.get('category');

  // Filter products by category if specified
  let filteredProducts = criticalData.collection.products;
  if (category && criticalData.collection.products?.nodes) {
    const filtered = criticalData.collection.products.nodes.filter(
      (product: any) => {
        return product.tags
          .map((tag: string) => tag.toUpperCase())
          .includes(category.toUpperCase());
      },
    );
    filteredProducts = {
      ...criticalData.collection.products,
      nodes: filtered,
    };
  }

  return {
    ...deferredData,
    ...criticalData,
    grid,
    category,
    filteredProducts,
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 60, // Increased to match collections.all
  });

  if (!handle) {
    throw redirect('/collections/all');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        country: storefront.i18n?.country,
        language: storefront.i18n?.language,
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
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
  const {collection, filteredProducts, grid, category} =
    useLoaderData<typeof loader>();
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
  }, [location.pathname]);

  const allProducts = collection.products?.nodes || [];

  return (
    <div className="collection bg-gray-100">
      {/* Filter navigation - only show if not in grid mode */}
      {!grid && (
        <div className="fixed top-0 left-0 w-full p-4 z-10 800:max-w-[80%]">
          <div className="flex items-start leading-none flex-wrap gap-2">
            <span className="text-sm relative top-2 inline-block mr-8">
              FILTER
            </span>
            <LocalizedLink
              to={`/collections/${collection.handle}`}
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === null && 'italic',
              )}
            >
              All {collection.title} ({allProducts?.length ?? 0})
            </LocalizedLink>
            <LocalizedLink
              to={`/collections/${collection.handle}?category=hats`}
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === 'hats' && 'italic',
              )}
            >
              Hats (
              {allProducts?.filter((product: any) =>
                product.tags.includes('Hats'),
              ).length ?? 0}
              )
            </LocalizedLink>
            <LocalizedLink
              to={`/collections/${collection.handle}?category=clothing`}
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === 'clothing' && 'italic',
              )}
            >
              Clothing (
              {allProducts?.filter((product: any) =>
                product.tags.includes('Clothing'),
              ).length ?? 0}
              )
            </LocalizedLink>
            <LocalizedLink
              to={`/collections/${collection.handle}?category=accessories`}
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === 'accessories' && 'italic',
              )}
            >
              Accessories (
              {allProducts?.filter((product: any) =>
                product.tags.includes('Accessories'),
              ).length ?? 0}
              )
            </LocalizedLink>
            <LocalizedLink
              to={`/collections/${collection.handle}?category=goods`}
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === 'goods' && 'italic',
              )}
            >
              Goods (
              {allProducts?.filter((product: any) =>
                product.tags.includes('Goods'),
              ).length ?? 0}
              )
            </LocalizedLink>
          </div>
        </div>
      )}

      {/* Grid view header */}
      {grid && (
        <div className="hidden 800:grid grid-cols-10 text-white gap-0 bg-black">
          <div className="col-span-2 p-1.5 hidden 800:block">SKU</div>
          <div className="col-span-1 p-1.5">Thumbnail</div>
          <div className="col-span-6 800:col-span-3 p-1.5">Product</div>
          <div className="col-span-2 p-1.5">Price</div>
          <div className="col-span-1 p-1.5"></div>
        </div>
      )}

      {/* Products grid */}
      <div
        className={clsx(
          'grid gap-0',
          grid ? 'grid-cols-1' : 'grid-cols-2 800:grid-cols-4 gap-0',
        )}
      >
        {filteredProducts?.nodes?.map((product: any, index: number) => {
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
        })}
      </div>
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment ProductVariantFields on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariantFields
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariantFields
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    variants(first: 250) {
      nodes {
        ...ProductVariantFields
      }
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

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/collection
const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...CollectionItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
