# Product Age Analysis Feature

This feature automatically analyzes the age of products referenced in homepage modules and provides insights about which products may need updating.

## How It Works

### 1. Sanity Function (`functions/product-map/index.ts`)

The function is triggered whenever a homepage document is updated. It:

- Extracts all product references from grid modules in the homepage
- Fetches the creation and update dates for each product
- Calculates the age in days since the last update
- Determines if products are "old" (older than 30 days)
- Stores this analysis in the homepage document's `productAgeAnalysis` field

### 2. Homepage Schema Enhancement

Added a new `productAgeAnalysis` field to the homepage schema that includes:

- **Product Reference**: Link to the product
- **Last Updated**: When the product was last modified
- **Created At**: When the product was created
- **Age in Days**: Days since last update
- **Is Old**: Boolean flag for products older than 30 days

The field includes a rich preview showing product titles, age, and status indicators.

### 3. Frontend Integration

#### GROQ Queries
- `PRODUCT_AGE_ANALYSIS_QUERY`: Fetches product age data with product details
- Updated `HOME_PAGE_QUERY` to include the product age analysis

#### React Components
- `ProductAgeAnalysis`: A debug-mode component that displays:
  - Summary statistics (total products, old products, average age)
  - Detailed list of all products with their ages
  - Visual indicators (🔴 for old, 🟢 for fresh products)
  - Actionable warnings when old products are detected

## Usage

### For Developers

1. **Enable Debug Mode**: Use the debug toggle to see the product age analysis
2. **View Analysis**: The component appears in the bottom-right corner when debug mode is active
3. **Monitor Product Health**: Get immediate feedback about content freshness

### For Content Managers

1. **Automatic Updates**: The analysis updates whenever the homepage is saved
2. **Visual Indicators**: Clear color coding shows product status at a glance
3. **Actionable Insights**: Specific warnings about products needing attention

## Configuration

### Age Threshold
Currently set to 30 days in the function. To change this:

```typescript
const isOld = ageInDays > 30; // Change 30 to desired threshold
```

### Trigger Events
The function runs on:
- Homepage document creation
- Homepage document updates
- Module changes within the homepage

## Benefits

1. **Content Freshness**: Easily identify stale product content
2. **Maintenance Alerts**: Proactive notifications about outdated products
3. **Performance Insights**: Understand content update patterns
4. **Quality Control**: Ensure homepage showcases current products

## Technical Details

### Data Flow
1. Homepage updated → Sanity function triggered
2. Function analyzes product references → Calculates ages
3. Analysis stored in homepage document → Frontend queries data
4. Debug component displays insights → Content team takes action

### Performance
- Analysis runs asynchronously after document updates
- Cached in the homepage document for fast frontend access
- Minimal impact on page load times

## Future Enhancements

- Configurable age thresholds per product type
- Email notifications for critical age thresholds
- Batch analysis across multiple pages
- Integration with content workflows
- Historical trending of product ages
