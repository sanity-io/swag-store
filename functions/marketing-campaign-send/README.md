# Marketing Campaign Create Function

This function automatically creates Klaviyo campaigns and templates when posts are published in Sanity.

## Installation

Before using this function, install the required dependency:

```bash
cd functions/marketing-campaign-create
npm install @portabletext/html
```

## Dependencies

- `@sanity/client`: For Sanity operations
- `@sanity/functions`: For Sanity function framework
- `@portabletext/html`: For converting Portable Text to HTML

## Usage

The function will automatically run when a post is published and:
1. Creates a Klaviyo email template with the post content
2. Creates a Klaviyo campaign using that template
3. Stores references in a marketingCampaign document
4. Links the campaign to the post

## Environment Variables

Required environment variables:
- `KLAVIYO_API_KEY`: Your Klaviyo API key
- `KLAVIYO_LIST_ID`: Default Klaviyo list ID (can be overridden per post)
- `KLAVIYO_FROM_EMAIL`: Default from email address
- `KLAVIYO_FROM_NAME`: Default from name
