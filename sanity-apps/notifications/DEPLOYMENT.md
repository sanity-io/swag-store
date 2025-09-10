# Deployment Guide

This guide covers deploying the Sanity Notification System App to production.

## Prerequisites

- Sanity project with write permissions
- Hosting platform account (Vercel, Netlify, etc.)
- Node.js 18+ environment

## Step 1: Sanity Studio Integration

1. **Add the notification schema to your main Sanity Studio project:**

   ```typescript
   // In your studio's sanity.config.ts
   import { defineConfig } from 'sanity'
   import { notification } from './path-to-notifications-app/schemas'
   
   export default defineConfig({
     // ... your existing config
     schema: {
       types: [
         // ... your existing schemas
         notification,
       ]
     }
   })
   ```

2. **Deploy your updated studio:**
   ```bash
   cd your-main-studio
   sanity deploy
   ```

## Step 2: Deploy the Notification App

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to Sanity:**
   ```bash
   npm run deploy
   ```

   This will provide you with a URL where your notification app is hosted.

## Step 3: Deploy API Endpoints

### Option A: Vercel

1. **Create `vercel.json` in your project root:**
   ```json
   {
     "functions": {
       "api/**/*.ts": {
         "runtime": "@vercel/node"
       }
     },
     "env": {
       "SANITY_PROJECT_ID": "@sanity-project-id",
       "SANITY_DATASET": "@sanity-dataset", 
       "SANITY_WRITE_TOKEN": "@sanity-write-token",
       "WEBHOOK_SECRET": "@webhook-secret",
       "CLEANUP_API_KEY": "@cleanup-api-key"
     },
     "crons": [{
       "path": "/api/notifications/cleanup",
       "schedule": "0 2 * * *"
     }]
   }
   ```

2. **Set environment variables:**
   ```bash
   vercel env add SANITY_PROJECT_ID
   vercel env add SANITY_DATASET
   vercel env add SANITY_WRITE_TOKEN
   vercel env add WEBHOOK_SECRET
   vercel env add CLEANUP_API_KEY
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option B: Netlify

1. **Create `netlify.toml`:**
   ```toml
   [build]
     functions = "api"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **Set environment variables in Netlify dashboard**

3. **Deploy via Git or CLI**

### Option C: Railway/Render/Other

Follow your platform's Node.js deployment guide and ensure:
- Environment variables are set
- API routes are accessible
- Cron jobs are configured for cleanup

## Step 4: Configure Webhook Endpoints

Your webhook endpoints will be available at:
- `https://your-domain.com/api/notifications/create`
- `https://your-domain.com/api/notifications/cleanup`

## Step 5: Set Up Automated Cleanup

### Vercel Cron Jobs
Already configured in `vercel.json` above.

### Manual Cron Job
Add to your server's crontab:
```bash
# Run cleanup daily at 2 AM
0 2 * * * /usr/bin/node /path/to/scripts/cleanup-cron.js
```

### GitHub Actions
Create `.github/workflows/cleanup.yml`:
```yaml
name: Cleanup Notifications
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:  # Manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run cleanup
        env:
          CLEANUP_ENDPOINT: ${{ secrets.CLEANUP_ENDPOINT }}
          CLEANUP_API_KEY: ${{ secrets.CLEANUP_API_KEY }}
```

## Step 6: Test the Deployment

1. **Test notification creation:**
   ```bash
   curl -X POST https://your-domain.com/api/notifications/create \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Notification",
       "message": "Testing the deployed notification system",
       "status": "success"
     }'
   ```

2. **Test cleanup endpoint:**
   ```bash
   curl -X POST https://your-domain.com/api/notifications/cleanup \
     -H "x-api-key: your-cleanup-api-key"
   ```

3. **Run demo script:**
   ```bash
   npm run demo https://your-domain.com/api/notifications/create
   ```

## Step 7: Monitoring and Maintenance

### Health Checks

Add health check endpoints to monitor your API:

```typescript
// api/health.ts
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}
```

### Logging

Configure logging for production:

```typescript
// In your API endpoints
const log = (level, message, data = {}) => {
  console.log(JSON.stringify({
    level,
    message,
    data,
    timestamp: new Date().toISOString()
  }))
}
```

### Error Tracking

Consider integrating with error tracking services:
- Sentry
- Rollbar  
- Bugsnag

## Security Considerations

1. **Always use HTTPS in production**
2. **Set strong webhook secrets**
3. **Rotate API keys regularly**
4. **Monitor for unusual activity**
5. **Rate limit your endpoints**

## Performance Optimization

1. **Enable CDN for static assets**
2. **Implement caching for read operations**
3. **Use database indexing for queries**
4. **Monitor response times**

## Troubleshooting

### Common Deployment Issues

1. **Environment variables not set:**
   - Verify all required variables are configured
   - Check variable names match exactly

2. **CORS issues:**
   - Configure CORS headers if needed
   - Ensure your domain is whitelisted

3. **Function timeouts:**
   - Increase timeout limits for cleanup operations
   - Optimize batch sizes for large datasets

4. **Permission errors:**
   - Verify Sanity write token has correct permissions
   - Check dataset access rights

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development npm run deploy
```

## Scaling Considerations

For high-volume deployments:

1. **Use message queues** for notification processing
2. **Implement database sharding** for large datasets  
3. **Add load balancing** for API endpoints
4. **Consider serverless functions** for auto-scaling

## Backup Strategy

1. **Regular database backups**
2. **Environment variable backups**
3. **Code repository backups**
4. **Configuration backups**

## Support

For deployment issues:
1. Check the logs first
2. Verify environment configuration
3. Test endpoints individually
4. Review the README.md for additional guidance
