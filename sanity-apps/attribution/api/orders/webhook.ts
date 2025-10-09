import { createClient } from '@sanity/client';
import { WebhookEvent } from '@sanity/webhook';

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'l3u4li5b',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

interface ShopifyOrderWebhook {
  id: number;
  order_number: number;
  email: string;
  customer?: {
    first_name?: string;
    last_name?: string;
  };
  line_items: Array<{
    id: number;
    product_id: number;
    variant_id: number;
    title: string;
    variant_title?: string;
    quantity: number;
    price: string;
    total_discount: string;
  }>;
  subtotal_price: string;
  total_tax: string;
  total_price: string;
  currency: string;
  created_at: string;
  updated_at: string;
  financial_status: string;
  fulfillment_status: string;
  utm_parameters?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  referring_site?: string;
  landing_site?: string;
  landing_site_ref?: string;
}

export async function handleOrderWebhook(event: WebhookEvent) {
  try {
    console.log('Processing order webhook:', event.type);
    
    if (event.type !== 'order.created' && event.type !== 'order.updated') {
      console.log('Ignoring webhook type:', event.type);
      return { success: true, message: 'Webhook type not handled' };
    }

    const orderData = event.payload as ShopifyOrderWebhook;
    
    // Extract attribution data from UTM parameters and other sources
    const attributions = extractAttributionData(orderData);
    
    // Process products and create references
    const processedProducts = await processOrderProducts(orderData.line_items);
    
    // Create or update order document
    const orderDocument = {
      _type: 'order',
      shopifyOrderId: orderData.id.toString(),
      orderNumber: orderData.order_number.toString(),
      customerEmail: orderData.email,
      customerName: orderData.customer 
        ? `${orderData.customer.first_name || ''} ${orderData.customer.last_name || ''}`.trim()
        : undefined,
      attributions,
      products: processedProducts,
      totalCost: parseFloat(orderData.subtotal_price),
      subtotal: parseFloat(orderData.subtotal_price),
      taxes: parseFloat(orderData.total_tax),
      shipping: 0, // This would need to be extracted from shipping lines if available
      totalAmount: parseFloat(orderData.total_price),
      currency: orderData.currency,
      orderDate: new Date(orderData.created_at),
      fulfillmentStatus: orderData.fulfillment_status || 'unfulfilled',
      paymentStatus: orderData.financial_status || 'pending',
      webhookData: {
        rawData: JSON.stringify(orderData),
        processedAt: new Date(),
        webhookId: event.id,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if order already exists
    const existingOrder = await client.fetch(
      `*[_type == "order" && shopifyOrderId == $shopifyOrderId][0]`,
      { shopifyOrderId: orderData.id.toString() }
    );

    let result;
    if (existingOrder) {
      // Update existing order
      result = await client
        .patch(existingOrder._id)
        .set(orderDocument)
        .commit();
      console.log('Updated existing order:', result._id);
    } else {
      // Create new order
      result = await client.create(orderDocument);
      console.log('Created new order:', result._id);
    }

    // Update attribution references
    await updateAttributionReferences(attributions, processedProducts, parseFloat(orderData.total_price));

    return { 
      success: true, 
      message: 'Order processed successfully',
      orderId: result._id 
    };

  } catch (error) {
    console.error('Error processing order webhook:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function extractAttributionData(orderData: ShopifyOrderWebhook) {
  const attributions = [];
  
  // Extract UTM parameters
  if (orderData.utm_parameters) {
    const utm = orderData.utm_parameters;
    attributions.push({
      source: utm.utm_source || 'unknown',
      medium: utm.utm_medium || 'unknown',
      campaign: utm.utm_campaign || 'unknown',
      content: utm.utm_content || 'unknown',
      term: utm.utm_term || 'unknown',
      utmSource: utm.utm_source,
      utmMedium: utm.utm_medium,
      utmCampaign: utm.utm_campaign,
      utmContent: utm.utm_content,
      utmTerm: utm.utm_term,
    });
  }

  // Extract referring site data
  if (orderData.referring_site) {
    attributions.push({
      source: 'referral',
      medium: 'referral',
      campaign: 'referral',
      content: orderData.referring_site,
      term: orderData.landing_site_ref || 'unknown',
    });
  }

  // If no attribution data found, mark as direct
  if (attributions.length === 0) {
    attributions.push({
      source: 'direct',
      medium: 'direct',
      campaign: 'direct',
      content: 'direct',
      term: 'direct',
    });
  }

  return attributions;
}

async function processOrderProducts(lineItems: ShopifyOrderWebhook['line_items']) {
  const processedProducts = [];
  
  for (const item of lineItems) {
    // Try to find existing product reference
    const existingProduct = await client.fetch(
      `*[_type == "product" && shopifyProductId == $productId][0]`,
      { productId: item.product_id.toString() }
    );

    processedProducts.push({
      productReference: existingProduct ? { _type: 'reference', _ref: existingProduct._id } : null,
      variantId: item.variant_id.toString(),
      title: item.title,
      variantTitle: item.variant_title || '',
      quantity: item.quantity,
      price: parseFloat(item.price),
      totalPrice: parseFloat(item.price) * item.quantity,
    });
  }

  return processedProducts;
}

async function updateAttributionReferences(
  attributions: any[], 
  products: any[], 
  totalAmount: number
) {
  try {
    // Update attribution references based on campaign data
    for (const attribution of attributions) {
      if (attribution.utmCampaign) {
        // Find campaigns with matching UTM campaign
        const campaigns = await client.fetch(
          `*[_type == "attribution_campaign" && utmParameters.utm_campaign == $campaign]`,
          { campaign: attribution.utmCampaign }
        );

        for (const campaign of campaigns) {
          // Update campaign revenue metrics
          const currentRevenue = campaign.revenueMetrics?.totalRevenue || 0;
          const currentOrders = campaign.revenueMetrics?.totalOrders || 0;
          
          await client
            .patch(campaign._id)
            .set({
              'revenueMetrics.totalRevenue': currentRevenue + totalAmount,
              'revenueMetrics.totalOrders': currentOrders + 1,
              'revenueMetrics.averageOrderValue': (currentRevenue + totalAmount) / (currentOrders + 1),
              'revenueMetrics.lastUpdated': new Date(),
              updatedAt: new Date(),
            })
            .commit();

          // Update product references in campaign
          for (const product of products) {
            if (product.productReference) {
              const existingProductRef = campaign.productReferences?.find(
                (ref: any) => ref.productReference._ref === product.productReference._ref
              );

              if (existingProductRef) {
                // Update existing product reference
                await client
                  .patch(campaign._id)
                  .set({
                    'productReferences[productReference._ref == $productRef].salesData.quantitySold': 
                      (existingProductRef.salesData?.quantitySold || 0) + product.quantity,
                    'productReferences[productReference._ref == $productRef].salesData.revenue': 
                      (existingProductRef.salesData?.revenue || 0) + product.totalPrice,
                    'productReferences[productReference._ref == $productRef].salesData.ordersCount': 
                      (existingProductRef.salesData?.ordersCount || 0) + 1,
                    'productReferences[productReference._ref == $productRef].salesData.lastUpdated': 
                      new Date(),
                    updatedAt: new Date(),
                  })
                  .commit();
              } else {
                // Add new product reference
                await client
                  .patch(campaign._id)
                  .append('productReferences', [{
                    productReference: product.productReference,
                    productTitle: product.title,
                    salesData: {
                      quantitySold: product.quantity,
                      revenue: product.totalPrice,
                      ordersCount: 1,
                      lastUpdated: new Date(),
                    }
                  }])
                  .commit();
              }
            }
          }
        }
      }
    }

    console.log('Updated attribution references successfully');
  } catch (error) {
    console.error('Error updating attribution references:', error);
  }
}
