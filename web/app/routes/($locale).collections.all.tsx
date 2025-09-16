import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {LocalizedLink} from '~/components/LocalizedLink';
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
  const category = searchParams.get('category');

  if (category) {
    const filteredProducts = criticalData.products.nodes.filter((product) => {
      return product.tags
        .map((tag) => tag.toUpperCase())
        .includes(category.toUpperCase());
    });

    return {
      ...deferredData,
      ...criticalData,
      grid,
      category,
      filteredProducts: {nodes: filteredProducts},
    };
  }

  return {
    ...deferredData,
    ...criticalData,
    grid,
    category,
    filteredProducts: criticalData.products,
  };
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
      variables: {
        ...paginationVariables,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
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
  const {filteredProducts, grid, products, category} =
    useLoaderData<typeof loader>();
  const allProducts = products.nodes;
  return (
    <div className="collection bg-gray-100">
      {!grid && (
        <div className="fixed top-0 left-0 w-full p-4 z-10 800:max-w-[80%]">
          <div className="flex items-start leading-none flex-wrap gap-2">
            <span className="text-sm relative top-2 inline-block mr-8">
              FILTER
            </span>
            <LocalizedLink
              to="/collections/all"
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === null && 'italic',
              )}
            >
              All Products ({allProducts?.length ?? 0})
            </LocalizedLink>
            <LocalizedLink
              to="/collections/all?category=hats"
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === 'hats' && 'italic',
              )}
            >
              Hats (
              {allProducts?.filter((product) => product.tags.includes('Hats'))
                .length ?? 0}
              )
            </LocalizedLink>
            <LocalizedLink
              to="/collections/all?category=clothing"
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === 'clothing' && 'italic',
              )}
            >
              Clothing (
              {allProducts?.filter((product) =>
                product.tags.includes('Clothing'),
              ).length ?? 0}
              )
            </LocalizedLink>
            <LocalizedLink
              to="/collections/all?category=accessories"
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === 'accessories' && 'italic',
              )}
            >
              Accessories (
              {allProducts?.filter((product) =>
                product.tags.includes('Accessories'),
              ).length ?? 0}
              )
            </LocalizedLink>
            <LocalizedLink
              to="/collections/all?category=goods"
              className={clsx(
                'text-24 800:text-56 mr-6 font-sans',
                category === 'goods' && 'italic',
              )}
            >
              Goods (
              {allProducts?.filter((product) => product.tags.includes('Goods'))
                .length ?? 0}
              )
            </LocalizedLink>
          </div>
        </div>
      )}
      {grid && (
        <div className="hidden 800:grid grid-cols-10 text-white gap-0 bg-black">
          <div className="col-span-2 p-1.5 hidden 800:block">SKU</div>
          <div className="col-span-1 p-1.5">Thumbnail</div>
          <div className="col-span-6 800:col-span-3 p-1.5">Product</div>
          <div className="col-span-2 p-1.5">Price</div>
          <div className="col-span-1 p-1.5"></div>
        </div>
      )}
      <div
        className={clsx(
          'grid gap-0',
          grid ? 'grid-cols-1' : 'grid-cols-2 800:grid-cols-4 gap-0',
        )}
      >
        {filteredProducts?.nodes?.map((product, index) => {
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
