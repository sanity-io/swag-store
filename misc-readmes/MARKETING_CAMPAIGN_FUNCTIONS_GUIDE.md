# Marketing Campaign Functions Guide

This guide explains the two Sanity Functions that work together to create and send marketing campaigns through Klaviyo, integrated with your Sanity Connect for Shopify setup.

## Overview

The marketing campaign system consists of two main functions that work in tandem:

1. **`marketing-campaign-create`** - Creates and updates marketing campaigns and email templates
2. **`marketing-campaign-send`** - Sends campaigns to subscribers

These functions leverage [Sanity Functions](https://www.sanity.io/docs/compute-and-ai/functions-introduction) to automatically process content changes and integrate with [Klaviyo's API](https://developers.klaviyo.com/en/reference/api_overview) for email marketing automation.

## Prerequisites

### Klaviyo Setup

Before using these functions, you need to set up your Klaviyo account:

1. **Create a Klaviyo Account**
   - Sign up at [klaviyo.com](https://www.klaviyo.com)
   - Complete account verification

2. **Create a List**
   - Navigate to Lists & Segments in your Klaviyo dashboard
   - Create a new list (e.g., "Newsletter Subscribers")
   - Note the List ID from the URL or list settings

3. **Generate API Key**
   - Go to Account → Settings → API Keys
   - Create a new API key with the following scopes:
     - `campaigns:read`
     - `campaigns:write`
     - `templates:read`
     - `templates:write`
   - Copy the API key for environment configuration

### Sanity Connect for Shopify

These functions work with content synced from Shopify via [Sanity Connect for Shopify](https://www.sanity.io/docs/apis-and-sdks/sanity-connect-for-shopify). The system expects:

- Products synced from Shopify as `shopify.product` documents
- Posts created in Sanity that reference these products
- Marketing campaigns that can be created from post content

## Function Architecture

### 1. Marketing Campaign Create Function

**File:** `functions/marketing-campaign-create/index.ts`

**Trigger:** Document changes on `post` documents

**Purpose:** Automatically creates and updates Klaviyo campaigns and email templates when posts are created or modified.

#### Key Features

- **Automatic Template Generation**: Converts Sanity Portable Text content into HTML email templates
- **Product Integration**: Renders Shopify products within email templates
- **Campaign Management**: Creates Klaviyo campaigns with proper audience targeting
- **Status Tracking**: Updates post status throughout the process
- **Error Handling**: Comprehensive error handling with notifications

#### Process Flow

1. **Document Event Trigger**
   - Listens for changes to `post` documents
   - Determines operation type (create/update) based on document state

2. **Template Generation**
   - Fetches post content including Portable Text body
   - Converts content to HTML using `@portabletext/to-html`
   - Renders Shopify products with pricing and images
   - Generates both HTML and text versions

3. **Klaviyo Integration**
   - Creates email template in Klaviyo
   - Creates marketing campaign with audience targeting
   - Links template to campaign message
   - Handles template updates for existing campaigns

4. **Sanity Document Management**
   - Creates `marketingCampaign` document
   - Links post to marketing campaign
   - Updates post status to `ready-for-review`

#### Environment Variables Required

```bash
KLAVIYO_API_KEY=your_klaviyo_api_key
KLAVIYO_LIST_ID=your_klaviyo_list_id
KLAVIYO_FROM_EMAIL=noreply@yourdomain.com
KLAVIYO_REPLY_TO_EMAIL=reply-to@yourdomain.com
KLAVIYO_CC_EMAIL=cc@yourdomain.com
KLAVIYO_BCC_EMAIL=bcc@yourdomain.com
```

### 2. Marketing Campaign Send Function

**File:** `functions/marketing-campaign-send/index.ts`

**Trigger:** Document changes on `marketingCampaign` documents

**Purpose:** Sends approved marketing campaigns to subscribers via Klaviyo.

#### Key Features

- **Campaign Validation**: Ensures campaign is ready for sending
- **Status Management**: Updates campaign and post status after sending
- **Error Handling**: Handles Klaviyo API errors gracefully
- **Rate Limiting**: Respects Klaviyo's API rate limits

#### Process Flow

1. **Document Event Trigger**
   - Listens for changes to `marketingCampaign` documents
   - Validates campaign has required Klaviyo campaign ID

2. **Campaign Sending**
   - Calls Klaviyo's send job API
   - Handles various error scenarios (rate limits, permissions, etc.)
   - Updates campaign status to `sent`

3. **Status Updates**
   - Updates marketing campaign document with send timestamp
   - Updates post status to `sent`
   - Creates success/error notifications

#### Environment Variables Required

```bash
KLAVIYO_API_KEY=your_klaviyo_api_key
```

## Integration with Sanity Connect for Shopify

These functions work seamlessly with [Sanity Connect for Shopify](https://www.sanity.io/docs/apis-and-sdks/sanity-connect-for-shopify) to create a complete e-commerce marketing automation system:

### Content Flow

1. **Product Sync**: Products are synced from Shopify to Sanity as `shopify.product` documents
2. **Content Creation**: Marketing team creates posts in Sanity Studio referencing these products
3. **Campaign Generation**: The create function automatically generates email campaigns
4. **Campaign Sending**: The send function delivers campaigns to subscribers

### Custom Sync Handlers

For advanced use cases, you can implement [custom sync handlers](https://www.sanity.io/docs/developer-guides/custom-sync-handlers-for-sanity-connect) to:

- Filter which products get synced
- Transform product data before syncing
- Reduce document usage by customizing sync behavior

## Notification System

Both functions integrate with a comprehensive notification system that provides real-time feedback:

### Notification Types

- **Success Notifications**: Campaign created, updated, or sent successfully
- **Error Notifications**: Detailed error information for troubleshooting
- **Status Updates**: Real-time status changes throughout the process

### Notification Features

- **Document-Specific**: Notifications are linked to specific posts and campaigns
- **Rich Metadata**: Includes action type, post title, and error details
- **Auto-Cleanup**: Notifications expire after 7 days
- **Studio Integration**: Notifications appear in Sanity Studio interface

## Email Template System

The system generates professional email templates with:

### Design Features

- **Responsive Design**: Mobile-optimized layouts
- **Brand Consistency**: Customizable branding and styling
- **Product Showcase**: Dynamic product rendering with pricing
- **Call-to-Actions**: Strategic placement of buttons and links

### Content Integration

- **Portable Text Support**: Renders rich text content from Sanity
- **Image Handling**: Automatic image optimization and responsive sizing
- **Product Blocks**: Special rendering for Shopify product references
- **Dynamic Content**: Personalized content based on post data

## Error Handling and Monitoring

### Comprehensive Error Handling

- **API Error Handling**: Specific handling for Klaviyo API errors
- **Rate Limit Management**: Respects Klaviyo's rate limits (10/s burst, 150/m steady)
- **Validation Errors**: Checks for required fields and data integrity
- **Network Errors**: Retry logic for transient failures

### Monitoring and Logging

- **Detailed Logging**: Comprehensive console logging for debugging
- **Error Notifications**: Automatic error notifications in Sanity Studio
- **Status Tracking**: Real-time status updates throughout the process

## Usage Examples

### Creating a Marketing Campaign

1. **Create a Post in Sanity Studio**
   ```groq
   {
     _type: "post",
     title: "New Product Launch",
     body: [
       {
         _type: "block",
         children: [
           {
             _type: "span",
             text: "Check out our latest products!"
           }
         ]
       },
       {
         _type: "products",
         products: [
           {
             _ref: "shopify-product-123",
             _type: "reference"
           }
         ]
       }
     ],
     klaviyoListId: "your-list-id"
   }
   ```

2. **Function Automatically Triggers**
   - Creates Klaviyo template with rendered content
   - Creates Klaviyo campaign with audience targeting
   - Links post to marketing campaign
   - Updates post status to `ready-for-review`

### Sending a Campaign

1. **Update Marketing Campaign Status**
   ```groq
   {
     _id: "marketingCampaign-post-123",
     status: "ready-to-send"
   }
   ```

2. **Function Automatically Triggers**
   - Sends campaign via Klaviyo API
   - Updates campaign status to `sent`
   - Updates post status to `sent`
   - Creates success notification

## Best Practices

### Content Strategy

- **Consistent Branding**: Use consistent styling across all email templates
- **Mobile-First**: Design content with mobile devices in mind
- **Clear CTAs**: Include clear call-to-action buttons
- **Product Focus**: Highlight key products and benefits

### Technical Considerations

- **Rate Limiting**: Be mindful of Klaviyo's API rate limits
- **Error Handling**: Implement proper error handling and retry logic
- **Testing**: Test campaigns in Klaviyo's preview mode before sending
- **Monitoring**: Monitor function logs and notifications for issues

### Performance Optimization

- **Template Caching**: Reuse templates when possible
- **Batch Operations**: Group related operations together
- **Async Processing**: Use async/await for better performance
- **Resource Management**: Clean up resources after operations

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify API key has correct permissions
   - Check API key is not expired
   - Ensure API key is properly set in environment variables

2. **List ID Issues**
   - Verify list exists in Klaviyo
   - Check list ID is correct
   - Ensure list has subscribers

3. **Template Generation Issues**
   - Check Portable Text content structure
   - Verify product references are valid
   - Test template rendering in Klaviyo preview

4. **Campaign Sending Issues**
   - Verify campaign is in correct status
   - Check Klaviyo campaign settings
   - Review rate limit status

### Debugging Steps

1. **Check Function Logs**
   - Review console output for errors
   - Look for specific error messages
   - Check API response status codes

2. **Verify Environment Variables**
   - Ensure all required variables are set
   - Check variable values are correct
   - Test API key with Klaviyo directly

3. **Test API Calls**
   - Use Klaviyo's API documentation
   - Test API calls manually
   - Verify request/response format

## Conclusion

The marketing campaign functions provide a powerful, automated system for creating and sending email campaigns that integrate seamlessly with your Sanity Connect for Shopify setup. By leveraging Sanity Functions and Klaviyo's API, you can create sophisticated marketing automation workflows that scale with your business needs.

For more information, refer to:
- [Sanity Functions Documentation](https://www.sanity.io/docs/compute-and-ai/functions-introduction)
- [Sanity Connect for Shopify](https://www.sanity.io/docs/apis-and-sdks/sanity-connect-for-shopify)
- [Custom Sync Handlers](https://www.sanity.io/docs/developer-guides/custom-sync-handlers-for-sanity-connect)
- [Klaviyo API Documentation](https://developers.klaviyo.com/en/reference/api_overview)
