# Sanity Notification System App

A comprehensive notification system for Sanity Studio using the App SDK that allows external systems to push notifications and displays them prominently within the Studio interface.

## Features

- 📢 **Real-time Notifications**: Display notifications from external systems within Sanity Studio
- 🎯 **Status-based Filtering**: Filter notifications by success, warning, or error status
- ✅ **Read/Unread Management**: Mark notifications as read individually or in bulk
- 🗑️ **Automatic Cleanup**: Expired notifications are automatically removed
- 🔒 **Webhook Security**: Optional signature verification for webhook endpoints
- 📱 **Responsive Design**: Mobile-friendly interface with modern styling
- 🔄 **Lifecycle Management**: Notifications expire after 7 days by default

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Copy `env.example` to `.env.local` and configure:
   ```bash
   cp env.example .env.local
   ```

   Required variables:
   ```env
   SANITY_PROJECT_ID=your-project-id
   SANITY_DATASET=production
   SANITY_WRITE_TOKEN=your-write-token
   ```

   Optional but recommended:
   ```env
   WEBHOOK_SECRET=your-webhook-secret
   CLEANUP_API_KEY=your-cleanup-api-key
   ```

3. **Add Notification Schema to Your Sanity Studio**:
   In your main Sanity Studio project, add the notification schema:
   ```typescript
   // In your studio's schema configuration
   import { notification } from './path-to-notifications-app/schemas'
   
   export default createSchema({
     types: [
       // ... your other schemas
       notification,
     ]
   })
   ```

## Development

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Deployment

Deploy the app to Sanity:
```bash
npx sanity deploy
```

## Usage

### Creating Notifications via Webhook

Send a POST request to your webhook endpoint:

```bash
curl -X POST https://your-domain.com/api/notifications/create \
  -H "Content-Type: application/json" \
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

### Notification Statuses

- **success**: ✅ Green - Successful operations
- **warning**: ⚠️ Yellow - Warnings or non-critical issues  
- **error**: ❌ Red - Errors or failures

### API Endpoints

#### `POST /api/notifications/create`

Creates a new notification.

**Request Body:**
```typescript
{
  title: string          // Required, max 100 characters
  message: string        // Required, max 500 characters
  status?: 'success' | 'warning' | 'error'  // Default: 'success'
  source?: string        // Optional source system name
  metadata?: object      // Optional additional data
}
```

**Response:**
```typescript
{
  success: boolean
  notificationId?: string
  message?: string
}
```

#### `POST /api/notifications/cleanup`

Removes expired notifications (requires API key if configured).

**Headers:**
```
x-api-key: your-cleanup-api-key  // If CLEANUP_API_KEY is set
```

**Response:**
```typescript
{
  success: boolean
  cleanedCount?: number
  message?: string
}
```

### Integration Examples

#### With Sanity Functions

```javascript
export default async function myFunction(req, context) {
  try {
    // Your function logic here
    const result = await processContent()
    
    // Send success notification
    await fetch('https://your-domain.com/api/notifications/create', {
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
    await fetch('https://your-domain.com/api/notifications/create', {
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

#### With External Build Systems

```javascript
// In your CI/CD pipeline
const notifyBuildResult = async (success, message) => {
  await fetch('https://your-domain.com/api/notifications/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: success ? 'Build Successful' : 'Build Failed',
      message,
      status: success ? 'success' : 'error',
      source: 'CI/CD Pipeline',
      metadata: {
        buildId: process.env.BUILD_ID,
        branch: process.env.BRANCH_NAME
      }
    })
  })
}
```

### Automatic Cleanup

Set up automatic cleanup using the provided cron script:

1. **Using Node.js Cron Job:**
   ```bash
   # Run cleanup daily at 2 AM
   0 2 * * * /usr/bin/node /path/to/scripts/cleanup-cron.js
   ```

2. **Using Vercel Cron Jobs:**
   Add to your `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/notifications/cleanup",
       "schedule": "0 2 * * *"
     }]
   }
   ```

3. **Manual Cleanup:**
   ```bash
   node scripts/cleanup-cron.js
   ```

## Configuration

### Notification Expiration

By default, notifications expire after 7 days. To modify this, update the `expiresAt` field in the notification schema:

```typescript
{
  name: 'expiresAt',
  title: 'Expires At',
  type: 'datetime',
  initialValue: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
}
```

### Webhook Security

For production deployments, always use webhook signature verification:

1. Set `WEBHOOK_SECRET` in your environment
2. Include the signature in webhook requests using the `x-sanity-signature` header
3. The webhook endpoint will automatically verify signatures

### Customization

#### Styling

Modify the CSS files in `src/components/` to match your design system:
- `NotificationCenter.css` - Main container styles
- `NotificationItem.css` - Individual notification styles  
- `NotificationFilters.css` - Filter controls styles

#### Notification Schema

Extend the notification schema in `schemas/notification.ts` to add custom fields:

```typescript
{
  name: 'priority',
  title: 'Priority',
  type: 'string',
  options: {
    list: ['low', 'medium', 'high', 'urgent']
  }
}
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check that the notification schema is added to your Sanity Studio configuration

2. **Webhook authentication failing**: Verify that `WEBHOOK_SECRET` matches between your external system and the API endpoint

3. **Permission errors**: Ensure your `SANITY_WRITE_TOKEN` has write permissions for the dataset

4. **Cleanup not working**: Check that `CLEANUP_API_KEY` is correctly configured if using API key authentication

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment.

## Architecture

```
notifications/
├── src/
│   ├── components/           # React components
│   │   ├── NotificationCenter.tsx
│   │   ├── NotificationItem.tsx
│   │   ├── NotificationFilters.tsx
│   │   └── NotificationProvider.tsx
│   └── App.tsx              # Main app entry point
├── schemas/
│   └── notification.ts      # Sanity document schema
├── api/
│   └── notifications/       # API endpoints
│       ├── create.ts        # Webhook for creating notifications
│       └── cleanup.ts       # Cleanup expired notifications
├── scripts/
│   └── cleanup-cron.js      # Automated cleanup script
└── examples/
    └── webhook-usage.js     # Usage examples
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
