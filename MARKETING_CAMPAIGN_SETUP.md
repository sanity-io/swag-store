# Marketing Campaign Function Setup

This function automatically creates Klaviyo campaigns and templates when posts are published in Sanity, and stores the references in a new `marketingCampaign` content type.

## How It Works

1. **Triggers**: When a `page` document is published
2. **Condition**: Only runs if the page doesn't already have a `marketingCampaign` reference
3. **Actions**:
   - Creates a Klaviyo email template
   - Creates a Klaviyo campaign using that template
   - Creates a `marketingCampaign` document in Sanity
   - Links the campaign to the post
   - Updates the post status to "ready-for-review"

## Required Environment Variables

Add these to your environment configuration:

```bash
KLAVIYO_API_KEY=your_klaviyo_api_key_here
KLAVIYO_LIST_ID=your_klaviyo_list_id_here
KLAVIYO_FROM_EMAIL=noreply@yourdomain.com
KLAVIYO_FROM_NAME=Your Company Name
```

### How to Get Klaviyo Credentials

1. **API Key**: 
   - Go to Klaviyo Account → Settings → API Keys
   - Create a new API key with **required scopes**: `templates:write` and `campaigns:write`
   - The API key must have both permissions for the function to work

2. **List ID**:
   - Go to Klaviyo Lists & Segments
   - Select your target list
   - Copy the List ID from the URL or list settings

### API Requirements

- **API Version**: Uses Klaviyo API v2025-07-15 (latest stable version)
- **API Headers**: Uses `REVISION: 2025-07-15` header (required by Klaviyo)
- **Rate Limits**: 
  - Burst: 10 requests/second
  - Steady: 150 requests/minute
- **Scopes Required**: `templates:write`, `campaigns:write`
- **Endpoints**: 
  - Templates: `https://a.klaviyo.com/api/templates`
  - Campaigns: `https://a.klaviyo.com/api/campaigns`

## API Response Handling

The function properly handles Klaviyo API responses and errors:

### Response Structure
- **Templates**: Uses JSON:API format with `data.attributes` structure
- **Campaigns**: Uses JSON:API format with `data.attributes` and `data.relationships` structure

### Error Handling
The function includes comprehensive error handling for common API issues:

- **400 Bad Request**: Invalid data format or missing required fields
- **403 Forbidden**: Insufficient API key permissions
- **422 Unprocessable Entity**: Invalid relationships (list/template doesn't exist)
- **429 Rate Limit Exceeded**: API rate limits exceeded (10/s burst, 150/m steady)

### Required API Scopes
Your Klaviyo API key must have these scopes:
- `templates:write` - For creating email templates
- `campaigns:write` - For creating marketing campaigns

## Content Type Requirements

### marketingCampaign Schema

The function expects a `marketingCampaign` content type with these fields:

- `title` (string, required)
- `klaviyoCampaignId` (string, required)
- `klaviyoTemplateId` (string, required)
- `status` (string, with options: draft, scheduled, active, paused, completed, cancelled)
- `post` (reference to page, required)
- `createdAt` (datetime)
- `updatedAt` (datetime)
- `description` (text)

### Page Schema Updates

Your `page` content type needs:

- `marketingCampaign` field (reference to marketingCampaign)
- `status` field (string with options: draft, ready-for-review, published, archived)

## Function Configuration

The function is configured in `sanity.blueprint.ts`:

```typescript
defineDocumentFunction({
  name: 'marketing-campaign-create',
  src: 'functions/marketing-campaign-create',
  event: {
    on: ['publish'],
    filter: '_type == "page" && !defined(marketingCampaign)',
    projection: '{_id, _type, title, slug, marketingCampaign}',
  }
})
```

## Email Template Generation

The function automatically generates:

- **HTML Template**: Responsive email template with post title and CTA button
- **Text Template**: Plain text version for email clients that don't support HTML

### Customizing Templates

Edit the `generateEmailTemplate()` and `generateTextContent()` functions in the code to match your brand:

- Update colors, fonts, and styling
- Modify the email content and messaging
- Change the CTA button text and styling
- Update the domain in post URLs

## Workflow

1. **Create/Edit Post**: Content editor creates or updates a page
2. **Publish**: Page is published in Sanity
3. **Function Triggers**: Marketing campaign function runs automatically
4. **Klaviyo Integration**: Creates template and campaign via Klaviyo API
5. **Sanity Update**: Creates marketingCampaign document and links it to the post
6. **Status Update**: Post status changes to "ready-for-review"
7. **Manual Review**: Marketing team can review and schedule the campaign

## Error Handling

The function includes comprehensive error handling:

- **API Failures**: Logs detailed error information for debugging
- **Missing Credentials**: Gracefully handles missing environment variables
- **Document Creation**: Verifies successful creation before proceeding
- **Reference Updates**: Ensures all references are properly linked

## Monitoring & Debugging

### Logs to Watch For

- ✅ **Success**: "Marketing campaign creation completed"
- ⏭️ **Skipped**: "Post already has marketing campaign - skipping"
- ❌ **Errors**: API failures, credential issues, document creation problems

### Common Issues

1. **Missing API Key**: Check `KLAVIYO_API_KEY` environment variable
2. **Invalid List ID**: Verify `KLAVIYO_LIST_ID` is correct
3. **Permission Issues**: Ensure API key has campaign and template creation permissions
4. **Schema Mismatch**: Verify marketingCampaign content type exists and has required fields

## Testing

1. **Create a test page** in Sanity
2. **Publish the page** to trigger the function
3. **Check logs** for successful execution
4. **Verify in Klaviyo** that template and campaign were created
5. **Check Sanity** that marketingCampaign document was created and linked

## Security Considerations

- **API Key**: Store securely and never commit to version control
- **Permissions**: Use minimal required permissions for the Klaviyo API key
- **Rate Limiting**: Be aware of Klaviyo API rate limits
- **Error Logging**: Ensure sensitive information isn't logged

## Future Enhancements

- **Campaign Scheduling**: Add ability to schedule campaigns for specific dates
- **A/B Testing**: Support for creating multiple campaign variants
- **Analytics Integration**: Pull campaign performance metrics from Klaviyo
- **Template Library**: Pre-built email templates for different post types
- **Approval Workflow**: Multi-step approval process before campaign creation
