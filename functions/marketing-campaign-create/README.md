# Marketing Campaign Create Function

A Sanity function that automatically creates Klaviyo email campaigns and templates when blog posts are published in Sanity, enabling seamless content-to-marketing automation.

## Overview

This function listens for post publication events and automatically creates corresponding email marketing campaigns in Klaviyo, streamlining the process of turning blog content into marketing campaigns.

## Features

- **Automatic Campaign Creation**: Creates Klaviyo campaigns when posts are published
- **Template Generation**: Converts Portable Text content to HTML email templates
- **Content Integration**: Seamlessly integrates Sanity content with Klaviyo marketing
- **Campaign Management**: Stores campaign references in Sanity for tracking

## Installation

Before using this function, install the required dependencies:

```bash
cd functions/marketing-campaign-create
npm install
```

## Dependencies

- `@sanity/client`: For Sanity operations
- `@sanity/functions`: For Sanity function framework
- `@portabletext/html`: For converting Portable Text to HTML

## Environment Variables

Required environment variables:

- `KLAVIYO_API_KEY`: Your Klaviyo API key
- `KLAVIYO_LIST_ID`: Default Klaviyo list ID (can be overridden per post)
- `KLAVIYO_FROM_EMAIL`: Default from email address
- `KLAVIYO_FROM_NAME`: Default from name

## Configuration

The function is configured to:

- **Target Document Types**: `post` documents only
- **Trigger Events**: Document creation and updates
- **Content Processing**: Converts Portable Text to HTML for email templates

## Usage

The function automatically runs when blog posts are published and:

1. **Creates Email Template**: Converts post content to HTML email template
2. **Creates Campaign**: Generates Klaviyo campaign using the template
3. **Stores References**: Saves campaign data in a `marketingCampaign` document
4. **Links Content**: Establishes relationship between post and campaign

## Function Behavior

### On Post Publication
- Validates the post document type
- Extracts post content and metadata
- Converts Portable Text content to HTML
- Creates Klaviyo email template
- Generates Klaviyo campaign
- Stores campaign references in Sanity

### Content Processing
- Handles Portable Text blocks and formatting
- Converts to HTML suitable for email templates
- Preserves styling and structure
- Handles images and media content

## Error Handling

The function includes comprehensive error handling:

- Validates post content before processing
- Handles Klaviyo API errors gracefully
- Provides detailed error logging
- Continues processing other posts on individual failures

## Deployment

Deploy the function using the Sanity CLI:

```bash
sanity functions deploy marketing-campaign-create
```

## Monitoring

Monitor the function execution through:

- Sanity Functions dashboard
- Klaviyo dashboard for campaign creation
- Console logs for detailed operation information

## Benefits

This function provides several benefits:

- **Content Automation**: Automatically turns blog content into marketing campaigns
- **Time Savings**: Eliminates manual campaign creation process
- **Consistency**: Ensures consistent branding and formatting
- **Integration**: Seamlessly connects content and marketing systems

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all Klaviyo environment variables are set
2. **Klaviyo API Errors**: Verify your Klaviyo API key has proper permissions
3. **Content Formatting**: Check that post content is properly formatted

### Debug Mode

Enable detailed logging by checking the function logs in the Sanity dashboard.

## Related Documentation

- [Sanity Functions Documentation](https://www.sanity.io/docs/functions)
- [Klaviyo API Documentation](https://developers.klaviyo.com/en/reference/api-overview)
- [Portable Text Documentation](https://www.sanity.io/docs/presenting-block-text)

## Support

For issues related to this function, check the Sanity Functions logs and ensure all environment variables are properly configured.
