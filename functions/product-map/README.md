# Product Map Function

A Sanity function that maps Shopify product data to Sanity documents, creating and maintaining product references and relationships.

## Overview

This function processes product documents and creates mappings between Shopify products and Sanity content, enabling seamless integration between your e-commerce platform and content management system.

## Features

- **Product Mapping**: Maps Shopify products to Sanity documents
- **Reference Creation**: Creates product references for content relationships
- **Data Synchronization**: Keeps product data synchronized between systems
- **Relationship Management**: Maintains product-to-content relationships

## Installation

Before using this function, install the required dependencies:

```bash
cd functions/product-map
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
- **Operation Types**: Create, update, and delete operations

## Usage

The function automatically runs when product documents are:

1. **Created**: New products are mapped and references are created
2. **Updated**: Existing product mappings are updated
3. **Deleted**: Product references are cleaned up

## Function Behavior

### On Product Creation/Update
- Validates the product document type
- Extracts product data from the Shopify store object
- Creates or updates product mappings in Sanity
- Establishes relationships with other content
- Logs operation details

### On Product Deletion
- Removes product mappings and references
- Cleans up related content relationships
- Logs deletion operations

## Data Structure

The function processes products with the following structure:

```typescript
interface ShopifyPayload {
  _id: string;
  _type: string;
  store?: {
    tags?: string[] | string;
    slug?: {
      current: string;
    };
  };
}
```

## Error Handling

The function includes comprehensive error handling:

- Validates document types before processing
- Handles missing or invalid data gracefully
- Provides detailed error logging
- Continues processing other documents on individual failures

## Deployment

Deploy the function using the Sanity CLI:

```bash
sanity functions deploy product-map
```

## Monitoring

Monitor the function execution through:

- Sanity Functions dashboard
- Console logs for detailed operation information
- Sanity Studio for document changes

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all Sanity environment variables are set
2. **Permission Issues**: Verify your Sanity API token has write permissions
3. **Dataset Access**: Ensure the function has access to the target dataset

### Debug Mode

Enable detailed logging by checking the function logs in the Sanity dashboard.

## Related Documentation

- [Sanity Functions Documentation](https://www.sanity.io/docs/functions)
- [Sanity Client Documentation](https://www.sanity.io/docs/js-client)
- [Sanity Document API](https://www.sanity.io/docs/http-api)

## Support

For issues related to this function, check the Sanity Functions logs and ensure all environment variables are properly configured.
