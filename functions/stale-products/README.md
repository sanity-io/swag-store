# Stale Products Function

A Sanity function that identifies and manages stale products by analyzing product usage across home page modules and marking unused products for review or cleanup.

## Overview

This function analyzes product usage patterns across your site's home page modules to identify products that are no longer being used, helping maintain a clean and up-to-date product catalog.

## Features

- **Stale Product Detection**: Identifies products not used in home page modules
- **Usage Analysis**: Analyzes product references across content modules
- **Automated Cleanup**: Marks stale products for review or removal
- **Performance Optimization**: Helps maintain a lean product catalog

## Installation

Before using this function, install the required dependencies:

```bash
cd functions/stale-products
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
- **Document Types**: `product` and home page documents
- **Analysis Scope**: Home page modules and their product references

## Usage

The function automatically runs when:

1. **Home Page Updated**: Analyzes product usage when home page modules change
2. **Product Created**: Checks if new products are being used
3. **Scheduled Execution**: Can be run on a schedule to identify stale products

## Function Behavior

### Product Usage Analysis
- Fetches all home page documents and their modules
- Extracts product references from module items
- Identifies products that are not referenced anywhere
- Marks stale products with appropriate flags or metadata

### Stale Product Identification
- Compares product creation/update dates with usage patterns
- Identifies products that haven't been used in recent content
- Provides detailed analysis of product usage across modules

## Data Structure

The function processes documents with the following structure:

```typescript
interface HomePagePayload {
  _id: string;
  _type: string;
  modules?: Array<{
    _type: string;
    items?: Array<{
      _type: string;
      productWithVariant?: {
        product?: {
          _id: string;
        };
      };
    }>;
  }>;
}
```

## Error Handling

The function includes comprehensive error handling:

- Validates document types before processing
- Handles missing or invalid module data gracefully
- Provides detailed error logging
- Continues processing other documents on individual failures

## Deployment

Deploy the function using the Sanity CLI:

```bash
sanity functions deploy stale-products
```

## Monitoring

Monitor the function execution through:

- Sanity Functions dashboard
- Console logs for detailed operation information
- Sanity Studio for document changes

## Benefits

This function provides several benefits:

- **Content Cleanup**: Identifies unused products for removal
- **Performance**: Reduces catalog size by removing stale products
- **Maintenance**: Automates product lifecycle management
- **Analytics**: Provides insights into product usage patterns

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all Sanity environment variables are set
2. **Permission Issues**: Verify your Sanity API token has write permissions
3. **Module Structure**: Ensure home page modules follow expected structure

### Debug Mode

Enable detailed logging by checking the function logs in the Sanity dashboard.

## Related Documentation

- [Sanity Functions Documentation](https://www.sanity.io/docs/functions)
- [Sanity Client Documentation](https://www.sanity.io/docs/js-client)
- [Sanity Query Documentation](https://www.sanity.io/docs/query)

## Support

For issues related to this function, check the Sanity Functions logs and ensure all environment variables are properly configured.
