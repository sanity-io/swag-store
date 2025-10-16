# Sanity Shopify Product Slug Function

A Sanity function that automatically generates and manages product slugs for Shopify products, ensuring consistent URL structure and SEO optimization.

## Overview

This function processes product documents and automatically generates SEO-friendly slugs based on Shopify product data, maintaining consistency between your Sanity CMS and Shopify storefront.

## Features

- **Automatic Slug Generation**: Creates SEO-friendly slugs from product data
- **Shopify Integration**: Uses Shopify product information for slug generation
- **Slug Validation**: Ensures slugs are unique and properly formatted
- **SEO Optimization**: Generates slugs optimized for search engines

## Installation

Before using this function, install the required dependencies:

```bash
cd functions/sanity-shopify-product-slug
npm install
```

## Dependencies

- `@sanity/client`: For Sanity operations
- `@sanity/functions`: For Sanity function framework

## Environment Variables

Required environment variables:

- `SANITY_PROJECT_ID`: Your Sanity project ID
- `SANITY_DATASET`: Your Sanity dataset (defaults to 'production')
- `SANITY_API_TOKEN`: Your Sanity API token with write permissions

## Configuration

The function is configured to:

- **Target Dataset**: `production` (configurable)
- **Document Types**: `product` documents only
- **Slug Field**: Updates the `slug` field in product documents

## Usage

The function automatically runs when product documents are:

1. **Created**: New products get automatically generated slugs
2. **Updated**: Existing product slugs are updated if needed
3. **Slug Changes**: Ensures slug consistency across the system

## Function Behavior

### On Product Creation/Update
- Validates the product document type
- Checks if the product has a Shopify store slug
- Generates a new slug if one doesn't exist
- Updates the product document with the generated slug
- Logs operation details

### Slug Generation Logic
- Uses the Shopify store slug as the base
- Ensures the slug is unique within the dataset
- Applies proper formatting and validation
- Handles special characters and spaces

## Data Structure

The function processes products with the following structure:

```typescript
interface SanityDocument {
  _id: string;
  _type: string;
  slug: string | null;
  store?: {
    slug: {
      current: string;
    };
  };
}
```

## Error Handling

The function includes comprehensive error handling:

- Validates document types before processing
- Handles missing Shopify store data gracefully
- Provides detailed error logging
- Continues processing other documents on individual failures

## Deployment

Deploy the function using the Sanity CLI:

```bash
sanity functions deploy sanity-shopify-product-slug
```

## Monitoring

Monitor the function execution through:

- Sanity Functions dashboard
- Console logs for detailed operation information
- Sanity Studio for document changes

## SEO Benefits

This function provides several SEO benefits:

- **Consistent URLs**: Ensures all products have proper slug structure
- **Search Engine Friendly**: Generates slugs optimized for search engines
- **URL Consistency**: Maintains consistency between Sanity and Shopify
- **Automatic Management**: Reduces manual slug management overhead

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all Sanity environment variables are set
2. **Permission Issues**: Verify your Sanity API token has write permissions
3. **Slug Conflicts**: Check for duplicate slugs in your dataset

### Debug Mode

Enable detailed logging by checking the function logs in the Sanity dashboard.

## Related Documentation

- [Sanity Functions Documentation](https://www.sanity.io/docs/functions)
- [Sanity Client Documentation](https://www.sanity.io/docs/js-client)
- [Sanity Slug Documentation](https://www.sanity.io/docs/slug-type)

## Support

For issues related to this function, check the Sanity Functions logs and ensure all environment variables are properly configured.
