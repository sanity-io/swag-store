# Algolia Sync Function

A Sanity function that automatically syncs product data to Algolia search index when products are created, updated, or deleted in Sanity.

## Overview

This function listens for document events on product documents and automatically syncs the data to an Algolia search index, enabling fast and powerful search functionality for your e-commerce storefront.

## Features

- **Automatic Sync**: Syncs products to Algolia when they are created, updated, or deleted
- **Search Optimization**: Optimizes product data for search with proper indexing
- **Error Handling**: Robust error handling with detailed logging
- **Flexible Configuration**: Configurable index name and searchable fields

## Installation

Before using this function, install the required dependencies:

```bash
cd functions/algolia-sync
npm install
```

## Dependencies

- `@sanity/client`: For Sanity operations
- `@sanity/functions`: For Sanity function framework
- `algoliasearch`: For Algolia search operations

## Environment Variables

Required environment variables:

- `ALGOLIA_APP_ID`: Your Algolia application ID
- `ALGOLIA_WRITE_KEY`: Your Algolia write API key

## Configuration

The function is configured to use the following settings:

- **Index Name**: `products` (configurable via `ALGOLIA_INDEX_NAME`)
- **Document Types**: `product` documents only
- **Search Fields**: Title and other product metadata

## Usage

The function automatically runs when:

1. **Product Created**: New products are added to the Algolia index
2. **Product Updated**: Existing products are updated in the Algolia index
3. **Product Deleted**: Products are removed from the Algolia index

## Function Behavior

### On Product Creation/Update
- Fetches the complete product document from Sanity
- Transforms the data for optimal search performance
- Adds or updates the document in the Algolia index
- Logs success or error messages

### On Product Deletion
- Removes the product from the Algolia index using the document ID
- Logs the deletion operation

## Error Handling

The function includes comprehensive error handling:

- Catches and logs all errors during sync operations
- Throws errors to prevent silent failures
- Provides detailed error messages for debugging

## Deployment

Deploy the function using the Sanity CLI:

```bash
sanity functions deploy algolia-sync
```

## Monitoring

Monitor the function execution through:

- Sanity Functions dashboard
- Algolia dashboard for index updates
- Console logs for detailed operation information

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure `ALGOLIA_APP_ID` and `ALGOLIA_WRITE_KEY` are set
2. **Algolia Index Not Found**: Create the `products` index in your Algolia dashboard
3. **Permission Issues**: Verify your Algolia API key has write permissions

### Debug Mode

Enable detailed logging by checking the function logs in the Sanity dashboard or by adding additional console.log statements.

## Related Documentation

- [Sanity Functions Documentation](https://www.sanity.io/docs/functions)
- [Algolia JavaScript Client](https://www.algolia.com/doc/api-client/getting-started/install/javascript/)
- [Algolia Search Documentation](https://www.algolia.com/doc/)

## Support

For issues related to this function, check the Sanity Functions logs and ensure all environment variables are properly configured.
