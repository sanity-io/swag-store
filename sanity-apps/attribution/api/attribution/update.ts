import { createClient } from '@sanity/client';

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'l3u4li5b',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

interface AttributionUpdateData {
  contentType: 'page' | 'product' | 'collection';
  contentId: string;
  attributeKey: string;
  attributeValue: string;
  salesValue: number;
  addToCartCount?: number;
  ordersCount?: number;
}

export async function updateAttributionReference(data: AttributionUpdateData) {
  try {
    console.log('Updating attribution reference:', data);

    // Find existing attribution reference
    const existingReference = await client.fetch(
      `*[_type == "attribution_reference" && attributeKey == $key && attributeValue == $value][0]`,
      { key: data.attributeKey, value: data.attributeValue }
    );

    const updateData = {
      currentSalesValue: data.salesValue,
      addToCartCount: data.addToCartCount || 0,
      lastAttributionUpdate: new Date(),
      updatedAt: new Date(),
    };

    let result;
    if (existingReference) {
      // Update existing reference
      result = await client
        .patch(existingReference._id)
        .set(updateData)
        .commit();
      console.log('Updated existing attribution reference:', result._id);
    } else {
      // Create new reference
      const newReference = {
        _type: 'attribution_reference',
        contentType: data.contentType,
        attributeKey: data.attributeKey,
        attributeValue: data.attributeValue,
        currentSalesValue: data.salesValue,
        addToCartCount: data.addToCartCount || 0,
        conversionRate: data.ordersCount && data.addToCartCount 
          ? data.ordersCount / data.addToCartCount 
          : 0,
        isActive: true,
        lastAttributionUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      result = await client.create(newReference);
      console.log('Created new attribution reference:', result._id);
    }

    // Add to attribution history
    const historyEntry = {
      date: new Date(),
      salesValue: data.salesValue,
      addToCartCount: data.addToCartCount || 0,
      ordersCount: data.ordersCount || 0,
      source: 'webhook',
    };

    await client
      .patch(result._id)
      .append('attributionHistory', [historyEntry])
      .commit();

    return { 
      success: true, 
      message: 'Attribution reference updated successfully',
      referenceId: result._id 
    };

  } catch (error) {
    console.error('Error updating attribution reference:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function updateContentAttribution(
  contentType: 'page' | 'product' | 'collection',
  contentId: string,
  salesValue: number,
  addToCartCount: number = 0,
  ordersCount: number = 0
) {
  try {
    console.log(`Updating ${contentType} attribution:`, { contentId, salesValue, addToCartCount, ordersCount });

    // Find attribution references for this content
    const references = await client.fetch(
      `*[_type == "attribution_reference" && contentType == $type && contentReference._ref == $contentId]`,
      { type: contentType, contentId }
    );

    if (references.length === 0) {
      console.log(`No attribution references found for ${contentType}:`, contentId);
      return { success: true, message: 'No attribution references to update' };
    }

    // Update all references for this content
    for (const reference of references) {
      const conversionRate = addToCartCount > 0 ? ordersCount / addToCartCount : 0;
      
      await client
        .patch(reference._id)
        .set({
          currentSalesValue: salesValue,
          addToCartCount: addToCartCount,
          conversionRate: conversionRate,
          lastAttributionUpdate: new Date(),
          updatedAt: new Date(),
        })
        .commit();

      // Add to history
      const historyEntry = {
        date: new Date(),
        salesValue: salesValue,
        addToCartCount: addToCartCount,
        ordersCount: ordersCount,
        source: 'content_update',
      };

      await client
        .patch(reference._id)
        .append('attributionHistory', [historyEntry])
        .commit();
    }

    return { 
      success: true, 
      message: `Updated ${references.length} attribution references`,
      updatedCount: references.length 
    };

  } catch (error) {
    console.error('Error updating content attribution:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
