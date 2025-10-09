// Example webhook usage for the attribution app
// This shows how to integrate the attribution webhook handlers with your Shopify webhooks

const { handleOrderWebhook } = require('../api/orders/webhook');
const { updateAttributionReference, updateContentAttribution } = require('../api/attribution/update');

// Example Shopify webhook handler
async function handleShopifyWebhook(req, res) {
  try {
    const webhookEvent = {
      id: req.headers['x-shopify-webhook-id'],
      type: req.headers['x-shopify-topic'],
      payload: req.body
    };

    // Handle order webhooks
    if (webhookEvent.type === 'orders/create' || webhookEvent.type === 'orders/updated') {
      const result = await handleOrderWebhook(webhookEvent);
      
      if (result.success) {
        res.status(200).json({ message: 'Order processed successfully' });
      } else {
        res.status(400).json({ error: result.message });
      }
    } else {
      res.status(200).json({ message: 'Webhook type not handled' });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Example custom attribution update
async function updateProductAttribution(productId, salesValue, addToCartCount) {
  try {
    const result = await updateAttributionReference({
      contentType: 'product',
      contentId: productId,
      attributeKey: 'product_id',
      attributeValue: productId,
      salesValue: salesValue,
      addToCartCount: addToCartCount,
      ordersCount: Math.floor(addToCartCount * 0.15) // Assume 15% conversion rate
    });

    console.log('Attribution update result:', result);
    return result;

  } catch (error) {
    console.error('Error updating product attribution:', error);
    throw error;
  }
}

// Example campaign URL generation
function generateCampaignUrl(baseUrl, campaign) {
  const params = new URLSearchParams();
  
  if (campaign.utmParameters.utm_source) {
    params.append('utm_source', campaign.utmParameters.utm_source);
  }
  if (campaign.utmParameters.utm_medium) {
    params.append('utm_medium', campaign.utmParameters.utm_medium);
  }
  if (campaign.utmParameters.utm_campaign) {
    params.append('utm_campaign', campaign.utmParameters.utm_campaign);
  }
  if (campaign.utmParameters.utm_content) {
    params.append('utm_content', campaign.utmParameters.utm_content);
  }
  if (campaign.utmParameters.utm_term) {
    params.append('utm_term', campaign.utmParameters.utm_term);
  }

  return `${baseUrl}?${params.toString()}`;
}

// Example Express.js route setup
const express = require('express');
const app = express();

app.use(express.json());

// Shopify webhook endpoint
app.post('/webhooks/shopify/orders', handleShopifyWebhook);

// Custom attribution update endpoint
app.post('/api/attribution/update', async (req, res) => {
  try {
    const { contentType, contentId, salesValue, addToCartCount, ordersCount } = req.body;
    
    const result = await updateContentAttribution(
      contentType,
      contentId,
      salesValue,
      addToCartCount,
      ordersCount
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Campaign URL generation endpoint
app.post('/api/campaigns/generate-url', (req, res) => {
  try {
    const { baseUrl, campaign } = req.body;
    const generatedUrl = generateCampaignUrl(baseUrl, campaign);
    
    res.json({ 
      success: true, 
      generatedUrl,
      campaign: campaign.campaignName 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  handleShopifyWebhook,
  updateProductAttribution,
  generateCampaignUrl
};
