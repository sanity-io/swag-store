# Attribution App Deployment Guide

This guide covers deploying the Attribution app to Sanity and setting up the necessary webhook integrations.

## Prerequisites

- Sanity project with admin access
- Node.js 18+ installed
- Sanity CLI installed globally (`npm install -g @sanity/cli`)
- Webhook endpoint for receiving Shopify data

## Deployment Steps

### 1. Configure Environment Variables

Create a `.env` file in the attribution app directory:

```bash
cd sanity-apps/attribution
cp env.example .env
```

Edit `.env` with your project details:

```env
SANITY_PROJECT_ID=l3u4li5b
SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the App

```bash
npm run build
```

### 4. Deploy to Sanity

```bash
npm run deploy
```

This will deploy the app to your Sanity organization and make it available in the Sanity Studio.

## Webhook Setup

### Shopify Webhook Configuration

1. In your Shopify admin, go to Settings > Notifications
2. Scroll down to "Webhooks" section
3. Click "Create webhook"
4. Configure the webhook:
   - **Event**: Order creation, Order updated
   - **Format**: JSON
   - **URL**: `https://your-domain.com/webhooks/shopify/orders`
   - **API Version**: Latest stable

### Webhook Endpoint Implementation

Create a webhook endpoint in your main application:

```javascript
// web/app/routes/api.webhooks.shopify.orders.ts
import { handleOrderWebhook } from '../../sanity-apps/attribution/api/orders/webhook';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const webhookId = request.headers.get('x-shopify-webhook-id');
    const topic = request.headers.get('x-shopify-topic');

    const event = {
      id: webhookId,
      type: topic,
      payload: body
    };

    const result = await handleOrderWebhook(event);
    
    if (result.success) {
      return new Response('OK', { status: 200 });
    } else {
      return new Response(result.message, { status: 400 });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
```

## Environment Configuration

### Production Environment Variables

Set these environment variables in your production environment:

```env
# Sanity Configuration
SANITY_PROJECT_ID=your_production_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_production_api_token

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
```

### API Token Permissions

Ensure your Sanity API token has the following permissions:
- Read access to all document types
- Write access to: `order`, `attribution_reference`, `attribution_campaign`
- Create and update permissions for webhook data

## Monitoring and Maintenance

### Health Checks

Set up health check endpoints to monitor the attribution system:

```javascript
// Health check endpoint
app.get('/api/attribution/health', async (req, res) => {
  try {
    // Check Sanity connection
    const client = createClient({...});
    await client.fetch('*[_type == "order"][0]');
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      services: {
        sanity: 'connected',
        webhooks: 'active'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});
```

### Logging

Set up structured logging for webhook processing:

```javascript
// Log webhook events
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  event: 'webhook_received',
  type: webhookEvent.type,
  orderId: webhookEvent.payload.id,
  status: 'processing'
}));
```

### Data Cleanup

Set up automated cleanup using the provided script:

```bash
# Add to your cron jobs
0 2 * * * cd /path/to/attribution && npm run cleanup
```

## Troubleshooting

### Common Deployment Issues

1. **App not appearing in Sanity Studio**
   - Check organization ID in `sanity.cli.ts`
   - Verify project permissions
   - Ensure build completed successfully

2. **Webhook processing failures**
   - Check API token permissions
   - Verify webhook URL is accessible
   - Check webhook payload format

3. **Data not updating**
   - Verify webhook is receiving data
   - Check Sanity client configuration
   - Review error logs

### Debug Mode

Enable debug logging in production:

```env
DEBUG=attribution:*
NODE_ENV=production
```

### Performance Optimization

1. **Batch Processing**: Process multiple webhook events in batches
2. **Caching**: Cache frequently accessed data
3. **Rate Limiting**: Implement rate limiting for webhook endpoints
4. **Database Indexing**: Ensure proper indexing on Sanity queries

## Security Considerations

### Webhook Security

1. **Verify Webhook Signatures**: Always verify Shopify webhook signatures
2. **Rate Limiting**: Implement rate limiting on webhook endpoints
3. **Authentication**: Use proper authentication for API endpoints
4. **HTTPS Only**: Ensure all webhook URLs use HTTPS

### Data Privacy

1. **PII Handling**: Be careful with customer email and personal data
2. **Data Retention**: Follow data retention policies
3. **Access Control**: Limit access to attribution data
4. **Audit Logging**: Log all data access and modifications

## Scaling Considerations

### High Volume

For high-volume stores:
- Implement webhook queuing (Redis, RabbitMQ)
- Use batch processing for attribution updates
- Consider data archiving strategies
- Monitor API rate limits

### Multi-tenant

For multi-tenant setups:
- Isolate data by tenant
- Use separate Sanity datasets
- Implement tenant-specific webhook routing
- Consider separate attribution apps per tenant

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Sanity documentation
3. Check webhook logs and error messages
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial release
- Order tracking and attribution
- Campaign management
- Dashboard interface
- Webhook integration
