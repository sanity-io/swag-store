/**
 * OpenAI Product Feed API Endpoint
 * 
 * Generates product feed in various formats (TSV, CSV, JSON) according to
 * OpenAI Product Feed Specification: https://developers.openai.com/commerce/specs/feed
 * 
 * Usage:
 * - GET /api/openai-product-feed/tsv
 * - GET /api/openai-product-feed/csv
 * - GET /api/openai-product-feed/json
 */

import {type LoaderFunctionArgs} from 'react-router';
import {
  generateOpenAIProductFeedData,
  generateTSVFeed,
  generateCSVFeed,
  generateJSONFeed,
  type ProductData,
  type MerchantSettings,
} from '~/lib/openaiProductFeed';

const PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after) {
      nodes {
        id
        handle
        title
        description
        vendor
        productType
        tags
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
        selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
          id
          sku
          availableForSale
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
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
        metafields(identifiers: [
          {namespace: "custom", key: "gtin"},
          {namespace: "custom", key: "mpn"},
          {namespace: "custom", key: "brand"},
          {namespace: "custom", key: "material"},
          {namespace: "custom", key: "condition"}
        ]) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;

export async function loader({
  request,
  context,
  params,
}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {format} = params;
  const url = new URL(request.url);

  // Validate format
  if (!format || !['tsv', 'csv', 'json'].includes(format)) {
    return new Response('Invalid format. Use tsv, csv, or json', {
      status: 400,
    });
  }

  try {
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

    // Fetch all products (with pagination)
    const allProducts: ProductData[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const result: any = await storefront.query(PRODUCTS_QUERY, {
        variables: {
          first: 250,
          after: cursor,
          country: storefront.i18n?.country,
          language: storefront.i18n?.language,
        },
      });

      if (!result?.products?.nodes) {
        break;
      }

      // Transform products to ProductData format
      const products: ProductData[] = result.products.nodes.map((product: any) => ({
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
        metafields: product.metafields?.edges?.map((edge: any) => ({
          namespace: edge.node.namespace,
          key: edge.node.key,
          value: edge.node.value,
        })),
      }));

      allProducts.push(...products);

      hasNextPage = result.products.pageInfo.hasNextPage;
      cursor = result.products.pageInfo.endCursor;
    }

    // Generate feed data for all products
    const feedData = allProducts.map((product) =>
      generateOpenAIProductFeedData(product, baseUrl, merchantSettings, {
        enableSearch: true,
        enableCheckout: true,
      }),
    );

    // Generate feed in requested format
    let content: string;
    let contentType: string;

    switch (format) {
      case 'tsv':
        content = generateTSVFeed(feedData);
        contentType = 'text/tab-separated-values';
        break;
      case 'csv':
        content = generateCSVFeed(feedData);
        contentType = 'text/csv';
        break;
      case 'json':
      default:
        content = generateJSONFeed(feedData);
        contentType = 'application/json';
        break;
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="openai-product-feed.${format}"`,
        'Cache-Control': 'public, max-age=900', // Cache for 15 minutes
      },
    });
  } catch (error) {
    console.error('Error generating OpenAI product feed:', error);
    return new Response('Error generating product feed', {status: 500});
  }
}

