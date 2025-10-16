# Product Tag Processing for Sanity v3

Since the original `@sanity/functions` approach is not compatible with Sanity v3, we've implemented two alternative solutions for processing product tags and creating productMap and colorVariant documents.

## Solution 1: Custom Document Action (Manual)

A custom document action has been added to the Sanity Studio that allows content editors to manually process product tags.

### How to Use:
1. Open any product document in the Sanity Studio
2. Look for the "Process Product Tags" action in the document actions menu
3. Click the action to process the tags and create/update related documents

### What it does:
- Processes `sanity-parent-` tags to create/update productMap documents
- Processes `sanity-color-` tags to create/update colorVariant documents
- Updates the product document with references to the created documents

## Solution 2: Shopify Webhook (Automated)

A webhook endpoint has been created at `/api/shopify-webhook` that can be triggered from Shopify when products are updated.

### Setup:
1. Add the following environment variables to your `.env` file:
   ```
   SANITY_STUDIO_PROJECT_ID=your-project-id
   SANITY_STUDIO_DATASET=production
   SANITY_API_TOKEN=your-sanity-api-token
   ```

2. In your Shopify admin, create a webhook:
   - Event: `products/update`
   - Format: `JSON`
   - URL: `https://your-domain.com/api/shopify-webhook`

### How it works:
- Receives product updates from Shopify
- Automatically processes tags and creates/updates Sanity documents
- Links products to productMaps and colorVariants based on tags

## Tag Format

### Product Map Tags
- Format: `sanity-parent-{name}`
- Example: `sanity-parent-standard-baggu`
- Creates/updates a productMap document with ID `standard-baggu`

### Color Tags
- Format: `sanity-color-{color}`
- Example: `sanity-color-navy`
- Creates/updates a colorVariant document with colorName `navy`

## Benefits of the New Approach

1. **Sanity v3 Compatible**: Works with the current Sanity version
2. **Flexible**: Both manual and automated options available
3. **Maintainable**: Uses standard Sanity patterns and APIs
4. **Debuggable**: Better error handling and logging
5. **Scalable**: Can handle multiple tags and document types

## Migration Notes

The old function-based approach has been removed from the blueprint since it's not compatible with Sanity v3. The new solutions provide the same functionality using modern Sanity patterns.

## Future Enhancements

- AI-powered color value assignment for colorVariants
- Batch processing for multiple products
- Enhanced error reporting and monitoring
- Integration with Shopify's webhook verification system
