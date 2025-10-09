const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'l3u4li5b',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function createDemoData() {
  try {
    console.log('Creating demo attribution data...');

    // Create demo attribution campaign
    const campaign = await client.create({
      _type: 'attribution_campaign',
      campaignName: 'Summer Sale 2024',
      campaignDescription: 'Summer sale campaign for all products',
      pageTitle: 'Summer Sale Collection',
      pageUrl: 'https://example.com/collections/summer-sale',
      utmParameters: {
        utm_source: 'email',
        utm_medium: 'newsletter',
        utm_campaign: 'summer_sale_2024',
        utm_content: 'banner_top',
        utm_term: 'summer'
      },
      generatedUrl: 'https://example.com/collections/summer-sale?utm_source=email&utm_medium=newsletter&utm_campaign=summer_sale_2024&utm_content=banner_top&utm_term=summer',
      campaignStatus: 'active',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      revenueMetrics: {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        lastUpdated: new Date()
      },
      productReferences: [],
      trackingSettings: {
        trackAddToCart: true,
        trackPageViews: true,
        trackOrders: true,
        attributionWindow: 30
      },
      webhookSettings: {
        isWebhookActive: false
      },
      createdBy: 'demo',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Created campaign:', campaign._id);

    // Create demo attribution references
    const attributionRefs = [
      {
        contentType: 'product',
        contentTitle: 'Demo Product 1',
        contentSlug: 'demo-product-1',
        attributeKey: 'product_id',
        attributeValue: '12345',
        currentSalesValue: 1500.00,
        addToCartCount: 25,
        conversionRate: 0.12,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        contentType: 'collection',
        contentTitle: 'Summer Collection',
        contentSlug: 'summer-collection',
        attributeKey: 'collection_handle',
        attributeValue: 'summer',
        currentSalesValue: 3200.50,
        addToCartCount: 45,
        conversionRate: 0.18,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        contentType: 'page',
        contentTitle: 'Homepage',
        contentSlug: 'home',
        attributeKey: 'page_path',
        attributeValue: '/',
        currentSalesValue: 850.75,
        addToCartCount: 12,
        conversionRate: 0.25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const ref of attributionRefs) {
      const attributionRef = await client.create({
        _type: 'attribution_reference',
        ...ref,
        attributionHistory: [{
          date: new Date(),
          salesValue: ref.currentSalesValue,
          addToCartCount: ref.addToCartCount,
          ordersCount: Math.floor(ref.addToCartCount * ref.conversionRate),
          source: 'demo'
        }]
      });
      console.log('Created attribution reference:', attributionRef._id);
    }

    // Create demo orders
    const orders = [
      {
        _type: 'order',
        shopifyOrderId: '1001',
        orderNumber: '1001',
        customerEmail: 'customer1@example.com',
        customerName: 'John Doe',
        attributions: [{
          source: 'email',
          medium: 'newsletter',
          campaign: 'summer_sale_2024',
          content: 'banner_top',
          term: 'summer',
          utmSource: 'email',
          utmMedium: 'newsletter',
          utmCampaign: 'summer_sale_2024',
          utmContent: 'banner_top',
          utmTerm: 'summer'
        }],
        products: [{
          productReference: null,
          variantId: '12345',
          title: 'Demo Product 1',
          variantTitle: 'Size M',
          quantity: 2,
          price: 29.99,
          totalPrice: 59.98
        }],
        totalCost: 59.98,
        subtotal: 59.98,
        taxes: 4.80,
        shipping: 5.99,
        totalAmount: 70.77,
        currency: 'USD',
        orderDate: new Date('2024-06-15'),
        fulfillmentStatus: 'fulfilled',
        paymentStatus: 'paid',
        webhookData: {
          rawData: JSON.stringify({ demo: true }),
          processedAt: new Date(),
          webhookId: 'demo-webhook-1'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _type: 'order',
        shopifyOrderId: '1002',
        orderNumber: '1002',
        customerEmail: 'customer2@example.com',
        customerName: 'Jane Smith',
        attributions: [{
          source: 'social',
          medium: 'facebook',
          campaign: 'summer_sale_2024',
          content: 'carousel_ad',
          term: 'summer',
          utmSource: 'facebook',
          utmMedium: 'social',
          utmCampaign: 'summer_sale_2024',
          utmContent: 'carousel_ad',
          utmTerm: 'summer'
        }],
        products: [{
          productReference: null,
          variantId: '12346',
          title: 'Demo Product 2',
          variantTitle: 'Size L',
          quantity: 1,
          price: 49.99,
          totalPrice: 49.99
        }],
        totalCost: 49.99,
        subtotal: 49.99,
        taxes: 4.00,
        shipping: 0.00,
        totalAmount: 53.99,
        currency: 'USD',
        orderDate: new Date('2024-06-16'),
        fulfillmentStatus: 'fulfilled',
        paymentStatus: 'paid',
        webhookData: {
          rawData: JSON.stringify({ demo: true }),
          processedAt: new Date(),
          webhookId: 'demo-webhook-2'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const order of orders) {
      const orderDoc = await client.create(order);
      console.log('Created order:', orderDoc._id);
    }

    console.log('Demo data created successfully!');
    console.log('You can now view the attribution dashboard in your Sanity app.');

  } catch (error) {
    console.error('Error creating demo data:', error);
  }
}

// Run the demo data creation
createDemoData();
