import {type LoaderFunctionArgs} from 'react-router';
import {useLoaderData, type MetaFunction, useLocation} from 'react-router';
import {useEffect} from 'react';

import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductFormPDP} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Arrow} from '~/components/Icons';
import SanityImage from '~/components/SanityImage';
import {AddToCartButton} from '~/components/AddToCartButton';
import {PortableText} from '@portabletext/react';
import {portableRichText} from '~/serializers/richText';
import {Query} from 'hydrogen-sanity';
import {SANITY_PRODUCT_QUERY} from '~/groq/queries';
import {useDebug} from '~/contexts/DebugContext';
import {
  generateOpenAIProductFeedData,
  generateOpenAIProductFeedJSONLD,
  type ProductData,
  type MerchantSettings,
} from '~/lib/openaiProductFeed';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Sanity Market | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
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
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}, sanityProductResult] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
    context.sanity.query(SANITY_PRODUCT_QUERY, {
      handle,
    }),
  ]);

  const sanityProduct = sanityProductResult;

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  // Generate OpenAI Product Feed data (optional - don't fail page if this errors)
  let openAIJSONLD: object | null = null;
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Default merchant settings - these should ideally come from Sanity settings
    const merchantSettings: MerchantSettings = {
      sellerName: 'Sanity Market',
      sellerUrl: baseUrl,
      sellerPrivacyPolicy: `${baseUrl}/policies/privacy-policy`,
      sellerTermsOfService: `${baseUrl}/policies/terms-of-service`,
      returnPolicyUrl: `${baseUrl}/policies/refund-policy`,
      returnWindowDays: 30,
    };

    const productData: ProductData = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      featuredImage: product.featuredImage
        ? {
            url: product.featuredImage.url,
            altText: product.featuredImage.altText || undefined,
          }
        : undefined,
      images: product.images?.nodes?.map((img: any) => ({
        url: img.url,
        altText: img.altText || undefined,
      })),
      selectedOrFirstAvailableVariant: product.selectedOrFirstAvailableVariant
        ? {
            id: product.selectedOrFirstAvailableVariant.id,
            sku: product.selectedOrFirstAvailableVariant.sku || undefined,
            availableForSale:
              product.selectedOrFirstAvailableVariant.availableForSale,
            price: product.selectedOrFirstAvailableVariant.price
              ? {
                  amount: product.selectedOrFirstAvailableVariant.price.amount,
                  currencyCode:
                    product.selectedOrFirstAvailableVariant.price.currencyCode,
                }
              : undefined,
            image: product.selectedOrFirstAvailableVariant.image
              ? {
                  url: product.selectedOrFirstAvailableVariant.image.url,
                  altText:
                    product.selectedOrFirstAvailableVariant.image.altText ||
                    undefined,
                }
              : undefined,
          }
        : undefined,
      variants: product.variants?.nodes?.map((v: any) => ({
        id: v.id,
        sku: v.sku || undefined,
        availableForSale: v.availableForSale,
        price: v.price
          ? {
              amount: v.price.amount,
              currencyCode: v.price.currencyCode,
            }
          : undefined,
      })),
      // Metafields are optional - can be added later if needed
      metafields: undefined,
    };

    const openAIFeedData = generateOpenAIProductFeedData(
      productData,
      baseUrl,
      merchantSettings,
      {
        enableSearch: sanityProduct?.hideFromSearch !== 'hidden',
        enableCheckout: true,
      },
    );

    openAIJSONLD = generateOpenAIProductFeedJSONLD(openAIFeedData);
  } catch (error) {
    // Log error but don't fail the page
    console.error('Error generating OpenAI Product Feed data:', error);
  }

  return {
    product,
    sanityProduct,
    openAIJSONLD,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: LoaderFunctionArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const data = useLoaderData<typeof loader>();
  const {commentsEnabled} = useDebug();
  const {product, sanityProduct, openAIJSONLD} = data;
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
    // setTimeout(scrollToTop, 500);
  }, [location.pathname]); // Re-run when pathname changes

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title} = product;

  return (
    <div className="bg-gray grid grid-cols-2 gap-0">
      {/* OpenAI Product Feed JSON-LD */}
      {openAIJSONLD && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(openAIJSONLD),
          }}
        />
      )}
      {/* Standard Schema.org Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            description: product.description,
            image: selectedVariant?.image?.url,
            offers: {
              '@type': 'Offer',
              price: selectedVariant?.price?.amount,
              priceCurrency: selectedVariant?.price?.currencyCode,
              availability: selectedVariant?.availableForSale
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
            sku: selectedVariant?.sku,
          }),
        }}
      />
      <button
        onClick={() => window.history.back()}
        className="fixed cursor-pointer 800:hover:text-brand-yellow top-4 w-[80px] h-[80px] z-20 left-4"
      >
        <Arrow />
      </button>
      <div className="col-span-2 800:col-span-1 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-[125%]"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '5px',
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="relative z-10">
          <ProductImage image={selectedVariant?.image} />
          {sanityProduct?.images?.map((image: any, index: number) => {
            // Handle Sanity image data structure
            const imageAsset = image?.asset;
            const imageUrl = imageAsset?.url || '';
            const aspectRatio =
              imageAsset?.metadata?.dimensions?.aspectRatio || 1;

            return (
              <SanityImage
                key={image._key || index}
                image={image}
                alt={image.alt || `Product image ${index + 1}`}
                src={imageUrl}
                aspect={aspectRatio}
                srcSet=""
                maxWidth={800}
                className="object-cover w-full"
                containerClasses="w-full !max-w-full object-cover"
              />
            );
          })}
        </div>
      </div>
      <div className="col-span-2 800:col-span-1">
        <div className="p-4 flex 800:h-[calc(100vh-30px)] sticky top-0 flex-col justify-between">
          <div>
            <h1 className="text-24 800:text-56 font-sans mt-0 leading-none">
              {title}
              <br />
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </h1>
          </div>
          <div className="pb-[60px]">
            <Query
              query={SANITY_PRODUCT_QUERY}
              options={{initial: {data: sanityProduct}}}
            >
              {({data}) => {
                return (
                  <>
                    {commentsEnabled && (
                      <div className=" top-0 left-0 w-full p-2 z-10">
                        <div className="bg-black text-white border border-white p-4 rounded mb-4">
                          <h3 className="font-bold mb-2">PDP Debug Info:</h3>
                          <div className="text-sm">
                            <p>
                              <strong>GID:</strong> {data?.store?.gid ?? 0}
                            </p>
                            <p>
                              <strong>Category:</strong>{' '}
                              {data?.category?.slug.current ?? ''}
                            </p>
                            <p>
                              <strong>Handle:</strong> {data?.slug ?? ''}
                            </p>
                          </div>
                          <details className="mt-2">
                            <summary className="cursor-pointer font-semibold">
                              Raw Data
                            </summary>
                            <pre className="mt-2 text-xs bg-black p-2 rounded overflow-auto max-h-40">
                              Sanity Product:
                              <br />
                              {JSON.stringify(product, null, 2)}
                              <br />
                              Selected Variant:
                              <br />
                              {JSON.stringify(selectedVariant, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    )}
                    <PortableText
                      value={data?.body}
                      components={portableRichText}
                    />
                  </>
                );
              }}
            </Query>
            <p className="uppercase">
              Please allow up to 1-2 weeks for delivery.
            </p>
            <ProductFormPDP
              category={sanityProduct?.category?.slug.current} // FIXME: this is a hack to get the category of the product
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              enableBackInStock={sanityProduct?.backInStock}
            />
            <br />
          </div>
        </div>

        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>

      <div className="sticky w-full bottom-[40px] col-span-2 -mt-[40px] z-30">
        <Query
          query={SANITY_PRODUCT_QUERY}
          options={{initial: {data: sanityProduct}}}
        >
          {({data}) => (
            <AddToCartButton
              disabled={!selectedVariant || !selectedVariant.availableForSale}
              onClick={() => {
                // open('cart');
              }}
              className="w-full bg-brand-green !text-black font-sans text-16 font-bold h-[40px]"
              lines={
                selectedVariant
                  ? [
                      {
                        merchandiseId: selectedVariant.id,
                        quantity: 1,
                        selectedVariant,
                        attributes: [
                          {
                            key: 'category',
                            value: data?.category?.slug.current || '',
                          },
                        ],
                      },
                    ]
                  : []
              }
            >
              {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
            </AddToCartButton>
          )}
        </Query>
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
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
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    productType
    tags
    encodedVariantExistence
    encodedVariantAvailability
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
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
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 250) {
      nodes {
        id
        sku
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

