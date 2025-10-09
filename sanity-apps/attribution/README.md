# Attribution App

A Sanity app for tracking e-commerce attribution data, campaign performance, and sales analytics. This app helps you understand which content, campaigns, and channels are driving the most valuable traffic and conversions.

## Features

- **Order Tracking**: Capture and analyze order data from Shopify webhooks
- **Attribution References**: Track sales performance for pages, products, and collections
- **Campaign Management**: Create and monitor marketing campaigns with UTM parameters
- **Revenue Analytics**: Real-time tracking of sales, conversion rates, and campaign performance
- **Webhook Integration**: Seamless integration with Shopify and other e-commerce platforms

## Content Types

### Order
Tracks individual orders with complete attribution data:
- Customer information and contact details
- Product details and quantities
- Attribution data (UTM parameters, referral sources)
- Financial information (totals, taxes, shipping)
- Order status and fulfillment tracking

### Attribution Reference
Associates sales data with specific content:
- Links to pages, products, or collections
- Tracks current sales value and add-to-cart counts
- Maintains conversion rate calculations
- Historical performance tracking

### Attribution Campaign
Manages marketing campaigns and their performance:
- Campaign configuration with UTM parameters
- Generated URLs for easy sharing
- Revenue and conversion metrics
- Product-specific sales tracking
- Campaign status management

## Getting Started

### Prerequisites

- Node.js 18+ 
- Sanity CLI
- Sanity project with appropriate permissions

### Installation

1. Navigate to the attribution app directory:
   ```bash
   cd sanity-apps/attribution
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```
   SANITY_PROJECT_ID=your_project_id
   SANITY_DATASET=production
   SANITY_API_TOKEN=your_api_token
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Building for Production

Build the app:
```bash
npm run build
```

### Deployment

Deploy to Sanity:
```bash
npm run deploy
```

## Usage

### Creating Attribution Campaigns

1. Navigate to the Attribution Campaign section
2. Click "Create" to start a new campaign
3. Fill in campaign details:
   - Campaign name and description
   - Associated page/product/collection
   - UTM parameters for tracking
4. Save to generate the campaign URL

### Setting Up Webhooks

The app includes webhook handlers for processing order data:

```javascript
// Example webhook endpoint
app.post('/webhooks/shopify/orders', handleShopifyWebhook);
```

### Updating Attribution Data

Use the provided API functions to update attribution data:

```javascript
import { updateAttributionReference } from './api/attribution/update';

await updateAttributionReference({
  contentType: 'product',
  contentId: 'product-123',
  attributeKey: 'product_id',
  attributeValue: '123',
  salesValue: 1500.00,
  addToCartCount: 25
});
```

## API Reference

### Webhook Handlers

#### `handleOrderWebhook(event)`
Processes Shopify order webhooks and updates attribution data.

**Parameters:**
- `event`: Webhook event object with order data

**Returns:**
- `{ success: boolean, message: string, orderId?: string }`

#### `updateAttributionReference(data)`
Updates or creates attribution reference data.

**Parameters:**
- `data`: AttributionUpdateData object

**Returns:**
- `{ success: boolean, message: string, referenceId?: string }`

#### `updateContentAttribution(contentType, contentId, salesValue, addToCartCount, ordersCount)`
Updates attribution data for specific content.

**Parameters:**
- `contentType`: 'page' | 'product' | 'collection'
- `contentId`: ID of the content
- `salesValue`: Total sales value
- `addToCartCount`: Number of add-to-cart events
- `ordersCount`: Number of orders

## Dashboard

The attribution dashboard provides:

- **Metrics Overview**: Total revenue, orders, conversion rates
- **Recent Orders**: Latest order data with attribution details
- **Active Campaigns**: Current campaign performance
- **Top Performing Content**: Best-performing pages, products, and collections

## Scripts

### Demo Data
Create sample data for testing:
```bash
npm run demo
```

### Cleanup
Remove old data to keep the dataset clean:
```bash
npm run cleanup
```

## Configuration

### Campaign Settings
- **Attribution Window**: How long to attribute sales after campaign interaction (default: 30 days)
- **Tracking Events**: Configure which events to track (add to cart, page views, orders)
- **Webhook Settings**: Configure webhook URLs and authentication

### Data Retention
- Attribution history: 30 days
- Completed campaigns: 90 days
- Cancelled campaigns: 30 days
- Inactive references: 60 days

## Troubleshooting

### Common Issues

1. **Webhook not processing orders**
   - Check webhook URL configuration
   - Verify API token permissions
   - Check webhook payload format

2. **Attribution data not updating**
   - Verify content references exist
   - Check attribute key/value matching
   - Ensure webhook is properly configured

3. **Dashboard not loading data**
   - Check Sanity project permissions
   - Verify dataset configuration
   - Check for API rate limits

### Debug Mode

Enable debug logging by setting the environment variable:
```
DEBUG=attribution:*
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the UNLICENSED license.
