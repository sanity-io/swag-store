/**
 * OpenAI Product Feed Spec utility functions
 * Based on: https://developers.openai.com/commerce/specs/feed
 */

export interface OpenAIProductFeedData {
  // OpenAI Flags
  enable_search: boolean;
  enable_checkout: boolean;

  // Basic Product Data
  id: string;
  gtin?: string;
  mpn?: string;
  title: string;
  description: string;
  link: string;

  // Item Information
  condition?: 'new' | 'refurbished' | 'used';
  product_category: string;
  brand?: string;
  material?: string;
  dimensions?: string;
  length?: string;
  width?: string;
  height?: string;
  weight?: string;
  color?: string;
  size?: string;
  gender?: 'male' | 'female' | 'unisex';
  offer_id?: string;

  // Pricing
  price: string;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';

  // Media
  image_link: string;
  additional_image_link?: string[];

  // Merchant Info
  seller_name: string;
  seller_url: string;
  seller_privacy_policy?: string;
  seller_tos?: string;

  // Returns
  return_policy?: string;
  return_window?: number;

  // Reviews
  product_review_count?: number;
  product_review_rating?: number;
  store_review_count?: number;
  store_review_rating?: number;

  // Custom Variants
  custom_variant1_category?: string;
  custom_variant1_option?: string;
  custom_variant2_category?: string;
  custom_variant2_option?: string;
  custom_variant3_category?: string;
  custom_variant3_option?: string;
}

export interface ProductData {
  id: string;
  handle: string;
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  featuredImage?: {
    url?: string;
    altText?: string;
  };
  images?: Array<{
    url?: string;
    altText?: string;
  }>;
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  selectedOrFirstAvailableVariant?: {
    id: string;
    sku?: string;
    availableForSale?: boolean;
    price?: {
      amount: string;
      currencyCode: string;
    };
    image?: {
      url?: string;
      altText?: string;
    };
  };
  variants?: Array<{
    id: string;
    sku?: string;
    availableForSale?: boolean;
    price?: {
      amount: string;
      currencyCode: string;
    };
  }>;
  // Shopify metafields (if available)
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
  }>;
}

export interface MerchantSettings {
  sellerName: string;
  sellerUrl: string;
  sellerPrivacyPolicy?: string;
  sellerTermsOfService?: string;
  returnPolicyUrl?: string;
  returnWindowDays?: number;
}

/**
 * Get GTIN from product metafields
 */
function getGTIN(product: ProductData): string | undefined {
  return product.metafields?.find(
    (m) => m.namespace === 'custom' && m.key === 'gtin',
  )?.value;
}

/**
 * Get MPN from product metafields
 */
function getMPN(product: ProductData): string | undefined {
  return product.metafields?.find(
    (m) => m.namespace === 'custom' && m.key === 'mpn',
  )?.value;
}

/**
 * Get product category path from product type and tags
 */
function getProductCategory(product: ProductData): string {
  // Use productType if available, otherwise use first tag
  if (product.productType) {
    return product.productType;
  }
  if (product.tags && product.tags.length > 0) {
    return product.tags[0];
  }
  return 'General';
}

/**
 * Get availability status
 */
function getAvailability(
  variant?: ProductData['selectedOrFirstAvailableVariant'],
): 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder' {
  if (!variant) return 'out_of_stock';
  if (variant.availableForSale) return 'in_stock';
  return 'out_of_stock';
}

/**
 * Generate OpenAI Product Feed data from product data
 */
export function generateOpenAIProductFeedData(
  product: ProductData,
  baseUrl: string,
  merchantSettings: MerchantSettings,
  options?: {
    enableSearch?: boolean;
    enableCheckout?: boolean;
    condition?: 'new' | 'refurbished' | 'used';
    brand?: string;
    material?: string;
    dimensions?: string;
    returnPolicyUrl?: string;
    returnWindowDays?: number;
  },
): OpenAIProductFeedData {
  const productUrl = `${baseUrl}/products/${product.handle}`;
  const variant = product.selectedOrFirstAvailableVariant;
  const price = variant?.price?.amount || product.priceRange?.minVariantPrice?.amount || '0';
  const currency = variant?.price?.currencyCode || product.priceRange?.minVariantPrice?.currencyCode || 'USD';
  const imageUrl = variant?.image?.url || product.featuredImage?.url || '';
  const additionalImages = product.images
    ?.filter((img) => img.url && img.url !== imageUrl)
    .map((img) => img.url!)
    .slice(0, 10); // Limit to 10 additional images

  // Get GTIN/MPN from metafields
  const gtin = getGTIN(product);
  const mpn = getMPN(product);

  // Use MPN if GTIN is not available
  const mpnValue = mpn || (gtin ? undefined : product.id);

  return {
    // OpenAI Flags
    enable_search: options?.enableSearch ?? true,
    enable_checkout: options?.enableCheckout ?? true,

    // Basic Product Data
    id: product.id,
    gtin,
    mpn: mpnValue,
    title: product.title,
    description: product.description || product.title,
    link: productUrl,

    // Item Information
    condition: options?.condition || 'new',
    product_category: getProductCategory(product),
    brand: options?.brand || product.vendor,
    material: options?.material,
    dimensions: options?.dimensions,
    offer_id: variant ? `${product.id}-${variant.id}-${price}` : undefined,

    // Pricing
    price,
    currency,
    availability: getAvailability(variant),

    // Media
    image_link: imageUrl,
    additional_image_link: additionalImages && additionalImages.length > 0 ? additionalImages : undefined,

    // Merchant Info
    seller_name: merchantSettings.sellerName,
    seller_url: merchantSettings.sellerUrl,
    seller_privacy_policy: merchantSettings.sellerPrivacyPolicy,
    seller_tos: merchantSettings.sellerTermsOfService,

    // Returns
    return_policy: options?.returnPolicyUrl || merchantSettings.returnPolicyUrl,
    return_window: options?.returnWindowDays || merchantSettings.returnWindowDays,
  };
}

/**
 * Generate JSON-LD structured data for OpenAI Product Feed
 */
export function generateOpenAIProductFeedJSONLD(
  feedData: OpenAIProductFeedData,
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': feedData.link,
    name: feedData.title,
    description: feedData.description,
    sku: feedData.id,
    gtin: feedData.gtin,
    mpn: feedData.mpn,
    brand: feedData.brand
      ? {
          '@type': 'Brand',
          name: feedData.brand,
        }
      : undefined,
    category: feedData.product_category,
    image: feedData.image_link,
    additionalImage: feedData.additional_image_link,
    offers: {
      '@type': 'Offer',
      price: feedData.price,
      priceCurrency: feedData.currency,
      availability:
        feedData.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: feedData.link,
      seller: {
        '@type': 'Organization',
        name: feedData.seller_name,
        url: feedData.seller_url,
      },
    },
    aggregateRating: feedData.product_review_rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: feedData.product_review_rating,
          reviewCount: feedData.product_review_count || 0,
        }
      : undefined,
  };
}

/**
 * Convert feed data to TSV format
 */
export function generateTSVFeed(products: OpenAIProductFeedData[]): string {
  if (products.length === 0) return '';

  // Get all unique keys from all products
  const allKeys = new Set<string>();
  products.forEach((product) => {
    Object.keys(product).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys).sort();
  const rows = products.map((product) =>
    headers.map((header) => {
      const value = product[header as keyof OpenAIProductFeedData];
      if (value === undefined || value === null) return '';
      if (Array.isArray(value)) return value.join(',');
      return String(value);
    }),
  );

  return [
    headers.join('\t'),
    ...rows.map((row) => row.join('\t')),
  ].join('\n');
}

/**
 * Convert feed data to CSV format
 */
export function generateCSVFeed(products: OpenAIProductFeedData[]): string {
  if (products.length === 0) return '';

  const allKeys = new Set<string>();
  products.forEach((product) => {
    Object.keys(product).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys).sort();
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const rows = products.map((product) =>
    headers.map((header) => {
      const value = product[header as keyof OpenAIProductFeedData];
      if (value === undefined || value === null) return '';
      if (Array.isArray(value)) return escapeCSV(value.join(','));
      return escapeCSV(String(value));
    }),
  );

  return [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
}

/**
 * Convert feed data to JSON format
 */
export function generateJSONFeed(products: OpenAIProductFeedData[]): string {
  return JSON.stringify(products, null, 2);
}

