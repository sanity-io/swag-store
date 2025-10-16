# Marketing Campaign Send Function

A Sanity function that automatically sends Klaviyo email campaigns when marketing campaign documents are created or updated, enabling automated email marketing workflows.

## Overview

This function listens for marketing campaign document events and automatically triggers the sending of Klaviyo email campaigns, providing seamless automation between content creation and email marketing execution.

## Features

- **Automatic Campaign Sending**: Sends Klaviyo campaigns when triggered
- **Campaign Management**: Manages campaign status and scheduling
- **Error Handling**: Robust error handling for campaign sending
- **Status Tracking**: Tracks campaign sending status in Sanity

## Installation

Before using this function, install the required dependencies:

```bash
cd functions/marketing-campaign-send
npm install
```

## Dependencies

- `@sanity/client`: For Sanity operations
- `@sanity/functions`: For Sanity function framework

## Environment Variables

Required environment variables:

- `KLAVIYO_API_KEY`: Your Klaviyo API key
- `SANITY_PROJECT_ID`: Your Sanity project ID
- `SANITY_DATASET`: Your Sanity dataset (defaults to 'production')
- `SANITY_API_TOKEN`: Your Sanity API token with write permissions

## Configuration

The function is configured to:

- **Target Document Types**: `marketingCampaign` documents only
- **Trigger Events**: Document creation and updates
- **Campaign Status**: Manages campaign sending status

## Usage

The function automatically runs when marketing campaign documents are created or updated and:

1. **Validates Campaign**: Checks campaign data and Klaviyo references
2. **Sends Campaign**: Triggers the Klaviyo campaign sending
3. **Updates Status**: Updates campaign status in Sanity
4. **Logs Results**: Provides detailed logging of sending results

## Function Behavior

### On Campaign Creation/Update
- Validates the marketing campaign document
- Checks for required Klaviyo campaign references
- Sends the campaign via Klaviyo API
- Updates campaign status in Sanity
- Logs sending results and any errors

### Campaign Status Management
- Tracks campaign sending status
- Handles sending errors gracefully
- Provides detailed status updates
- Manages retry logic for failed sends

## Error Handling

The function includes comprehensive error handling:

- Validates campaign data before sending
- Handles Klaviyo API errors gracefully
- Provides detailed error logging
- Updates campaign status on failures

## Deployment

Deploy the function using the Sanity CLI:

```bash
sanity functions deploy marketing-campaign-send
```

## Monitoring

Monitor the function execution through:

- Sanity Functions dashboard
- Klaviyo dashboard for campaign status
- Console logs for detailed operation information

## Benefits

This function provides several benefits:

- **Automation**: Automatically sends campaigns without manual intervention
- **Reliability**: Robust error handling ensures campaigns are sent properly
- **Tracking**: Maintains campaign status in Sanity for monitoring
- **Integration**: Seamlessly connects Sanity with Klaviyo marketing

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all required environment variables are set
2. **Klaviyo API Errors**: Verify your Klaviyo API key has proper permissions
3. **Campaign References**: Check that campaign documents have valid Klaviyo references

### Debug Mode

Enable detailed logging by checking the function logs in the Sanity dashboard.

## Related Documentation

- [Sanity Functions Documentation](https://www.sanity.io/docs/functions)
- [Klaviyo API Documentation](https://developers.klaviyo.com/en/reference/api-overview)
- [Klaviyo Campaign API](https://developers.klaviyo.com/en/reference/campaigns)

## Support

For issues related to this function, check the Sanity Functions logs and ensure all environment variables are properly configured.
