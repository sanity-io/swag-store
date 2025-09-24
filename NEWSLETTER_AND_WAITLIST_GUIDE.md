# Newsletter and Waitlist System

This guide explains how to use the newsletter subscription and waitlist functionality that has been added to the Sanity + Hydrogen store.

## Components Created

### 1. Sanity Customer Content Type
- **File**: `sanity/schemaTypes/documents/customer.tsx`
- **Fields**:
  - `email`: Customer's email address (required, validated)
  - `acceptsMarketing`: Boolean for marketing opt-in (defaults to false)
  - `backInStock`: Array of product references for waitlist notifications
  - `createdAt`: Timestamp of when the customer was created

### 2. Newsletter Component
- **File**: `web/app/components/Newsletter.tsx`
- **Purpose**: General newsletter subscription form
- **Features**:
  - Email validation
  - Marketing opt-in checkbox (optional)
  - Success/error states
  - Can be used for both general newsletter and product waitlists

### 3. BackInStockForm Component
- **File**: `web/app/components/BackInStockForm.tsx`
- **Purpose**: Waitlist form for out-of-stock products
- **Features**:
  - Automatically sets `acceptsMarketing` to false by default
  - Adds product to customer's `backInStock` array
  - Shows when product is sold out

### 4. API Route
- **File**: `web/app/routes/($locale).newsletter.ts`
- **Purpose**: Handles form submissions
- **Features**:
  - Creates new customers or updates existing ones
  - Manages marketing preferences
  - Adds products to waitlist arrays

## Usage Examples

### Newsletter Subscription (General)
```tsx
import {Newsletter} from '~/components/Newsletter';

// Basic newsletter signup
<Newsletter />

// Customized newsletter signup
<Newsletter
  title="Stay Updated"
  description="Get the latest news and offers"
  showMarketingOptIn={true}
  className="my-custom-class"
/>
```

### Product Waitlist
```tsx
import {Newsletter} from '~/components/Newsletter';

// Waitlist for specific product
<Newsletter
  productId="gid://shopify/ProductVariant/123456789"
  title="Get Notified"
  description="We'll let you know when this is back in stock"
  showMarketingOptIn={false}
/>
```

### Out-of-Stock Product Form
The `BackInStockForm` is automatically used in `ProductForm.tsx` when a product variant is not available for sale:

```tsx
// This happens automatically in ProductForm when selectedVariant?.availableForSale is false
<BackInStockForm variant={selectedVariant} />
```

## How It Works

### Newsletter Subscription Flow
1. User enters email and optionally opts into marketing
2. Form submits to `/newsletter` API route
3. API checks if customer exists in Sanity
4. If exists: updates `acceptsMarketing` field
5. If new: creates customer with provided preferences
6. Success message shown to user

### Waitlist Flow
1. User sees out-of-stock product
2. `BackInStockForm` is displayed
3. User enters email (marketing opt-in defaults to false)
4. Form submits with product ID
5. API creates/updates customer and adds product to `backInStock` array
6. Success message confirms waitlist signup

## Sanity Studio

The customer content type will appear in your Sanity Studio where you can:
- View all subscribers
- See their marketing preferences
- Check which products they're waiting for
- Export customer data

## Environment Variables Required

Make sure these are set in your environment:
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_API_TOKEN` (for write operations)

## Customization

### Styling
Both components use Tailwind CSS classes and accept a `className` prop for custom styling.

### Text Content
All text content can be customized via props:
- `title`: Form heading
- `description`: Form description
- Button text changes based on context (Subscribe vs Join Waitlist)

### Behavior
- `showMarketingOptIn`: Controls whether marketing checkbox is shown
- `productId`: When provided, adds product to waitlist instead of general newsletter

## Integration Points

### Existing Subscribe Page
The `/subscribe` route has been updated to use the new Newsletter component.

### Product Pages
The ProductForm component automatically shows the waitlist form when products are out of stock.

### Footer
The existing footer already links to the subscribe page, which now uses the new system.

## Future Enhancements

Potential improvements you could add:
1. Email confirmation for subscriptions
2. Unsubscribe functionality
3. Admin dashboard for managing subscribers
4. Email notifications when products are back in stock
5. Integration with email marketing platforms
6. Analytics tracking for subscription rates
