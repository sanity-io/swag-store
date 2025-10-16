# Sanity Notification System

A comprehensive notification system for Sanity Studio that allows external systems to push notifications and displays them prominently within the Studio interface.

## Features

- ✅ **Notification Schema**: Complete document type with status, metadata, and lifecycle management
- 🔔 **Real-time Display**: Notification center with filtering and status indicators
- 🔗 **Webhook Integration**: API endpoint for external systems to create notifications
- 🧹 **Automatic Cleanup**: Scheduled service to remove expired notifications
- 🎨 **Modern UI**: Responsive design with status-based styling
- 📱 **Mobile Friendly**: Optimized for all screen sizes

## Project Structure

```
sanity-apps/notification-system/     # Sanity App SDK application
├── src/
│   ├── App.tsx                      # Main app component
│   ├── App.css                      # Global styles
│   └── components/
│       ├── NotificationCenter.tsx   # Main notification interface
│       ├── NotificationItem.tsx     # Individual notification display
│       ├── NotificationFilters.tsx  # Filter controls
│       ├── NotificationProvider.tsx # Context provider
│       └── *.css                    # Component styles

functions/
├── notification-webhook/            # Webhook API endpoint
│   ├── index.ts
│   └── package.json
└── notification-cleanup/            # Cleanup service
    ├── index.ts
    └── package.json

sanity/
├── schemaTypes/documents/
│   └── notification.tsx             # Notification schema
└── structure/
    └── notificationStructure.ts     # Studio structure configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Sanity App SDK dependencies
cd sanity-apps/notification-system
npm install

# Install webhook dependencies
cd ../../functions/notification-webhook
npm install

# Install cleanup service dependencies
cd ../notification-cleanup
npm install
```

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# Sanity Configuration
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_WRITE_TOKEN=your-write-token

# Webhook Security (optional but recommended)
WEBHOOK_SECRET=your-webhook-secret
```

### 3. Deploy the Sanity App

```bash
cd sanity-apps/notification-system
npx sanity@latest deploy
```

### 4. Deploy Webhook Endpoint

Deploy the webhook function to your preferred platform (Vercel, Netlify, etc.):

```bash
# Example for Vercel
cd functions/notification-webhook
vercel deploy
```

### 5. Set Up Cleanup Service

Set up the cleanup service as a scheduled function (cron job) to run daily:

```bash
# Example cron job (runs daily at 2 AM)
0 2 * * * cd /path/to/functions/notification-cleanup && node index.js
```

## Usage

### Creating Notifications via Webhook

Send a POST request to your webhook endpoint:

```bash
curl -X POST https://your-domain.com/api/notification-webhook \
  -H "Content-Type: application/json" \
  -H "X-Sanity-Signature: your-signature" \
  -d '{
    "title": "Document Updated",
    "message": "The homepage content has been successfully updated and published.",
    "status": "success",
    "source": "Content Management System",
    "metadata": {
      "documentId": "homepage-123",
      "action": "publish",
      "userId": "user-456"
    }
  }'
```

### Webhook Payload

```typescript
interface NotificationPayload {
  title: string                    // Required: Notification title (max 100 chars)
  message: string                  // Required: Notification message (max 500 chars)
  status?: 'success' | 'warning' | 'error'  // Optional: Defaults to 'success'
  source?: string                  // Optional: Source system name
  metadata?: {                     // Optional: Additional data
    documentId?: string
    action?: string
    userId?: string
    [key: string]: any
  }
}
```

### Integration Examples

#### With Sanity Functions

```javascript
// In a Sanity Function
export default async function myFunction(req, context) {
  try {
    // Your function logic here
    const result = await processContent()
    
    // Send success notification
    await fetch('https://your-domain.com/api/notification-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Function Executed Successfully',
        message: `Content processing completed for ${context.document?.title}`,
        status: 'success',
        source: 'Sanity Functions',
        metadata: {
          functionName: 'myFunction',
          documentId: context.document?._id
        }
      })
    })
    
    return result
  } catch (error) {
    // Send error notification
    await fetch('https://your-domain.com/api/notification-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Function Execution Failed',
        message: error.message,
        status: 'error',
        source: 'Sanity Functions',
        metadata: { error: error.stack }
      })
    })
    
    throw error
  }
}
```

#### With External Systems

```javascript
// Example: Shopify webhook integration
app.post('/webhooks/shopify', (req, res) => {
  const { order, customer } = req.body
  
  // Send notification to Sanity
  fetch('https://your-domain.com/api/notification-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'New Order Received',
      message: `Order #${order.order_number} from ${customer.first_name} ${customer.last_name}`,
      status: 'success',
      source: 'Shopify',
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        customerId: customer.id,
        total: order.total_price
      }
    })
  })
  
  res.status(200).send('OK')
})
```

## Notification Lifecycle

1. **Creation**: Notifications are created via webhook or directly in Sanity Studio
2. **Display**: Notifications appear in the Studio with unread indicators
3. **Interaction**: Users can mark notifications as read individually or in bulk
4. **Expiration**: Notifications automatically expire after 7 days (configurable)
5. **Cleanup**: Expired notifications are automatically removed by the cleanup service

## Customization

### Styling

Modify the CSS files in `sanity-apps/notification-system/src/components/` to customize the appearance:

- `NotificationCenter.css` - Main layout and header styles
- `NotificationItem.css` - Individual notification styling
- `NotificationFilters.css` - Filter controls styling

### Schema Modifications

Edit `sanity/schemaTypes/documents/notification.tsx` to add or modify fields:

```typescript
// Add a new field
defineField({
  name: 'priority',
  title: 'Priority',
  type: 'string',
  options: {
    list: [
      { title: 'Low', value: 'low' },
      { title: 'Medium', value: 'medium' },
      { title: 'High', value: 'high' }
    ]
  }
})
```

### Studio Structure

Modify `sanity/structure/notificationStructure.ts` to customize how notifications appear in the Studio sidebar.

## Security

- **Webhook Signatures**: Use the `WEBHOOK_SECRET` environment variable to verify webhook authenticity
- **Token Permissions**: Ensure your `SANITY_WRITE_TOKEN` has appropriate permissions
- **Rate Limiting**: Consider implementing rate limiting on your webhook endpoint

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check that the notification schema is properly deployed
2. **Webhook errors**: Verify environment variables and webhook signature validation
3. **Cleanup not working**: Ensure the cleanup service has proper permissions and is scheduled correctly

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages in webhook responses.

## Advanced Features

Consider implementing these additional features:

- **Real-time updates** using Sanity's listening capabilities
- **Email/SMS integration** for critical notifications
- **User-specific notifications** with targeting
- **Notification templates** for consistent messaging
- **Analytics and reporting** on notification engagement
- **Bulk operations** for managing multiple notifications

## Support

For issues or questions, please refer to the Sanity documentation or create an issue in your project repository.
