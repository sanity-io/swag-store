const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'l3u4li5b',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function cleanupOldData() {
  try {
    console.log('Starting cleanup of old attribution data...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clean up old attribution history entries (keep only last 30 days)
    const oldHistoryEntries = await client.fetch(
      `*[_type == "attribution_reference" && attributionHistory[date < $cutoffDate]]`,
      { cutoffDate: thirtyDaysAgo }
    );

    for (const reference of oldHistoryEntries) {
      const filteredHistory = reference.attributionHistory.filter(
        (entry: any) => new Date(entry.date) >= thirtyDaysAgo
      );

      if (filteredHistory.length !== reference.attributionHistory.length) {
        await client
          .patch(reference._id)
          .set({ attributionHistory: filteredHistory })
          .commit();
        
        console.log(`Cleaned up history for reference: ${reference._id}`);
      }
    }

    // Clean up completed campaigns older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const oldCompletedCampaigns = await client.fetch(
      `*[_type == "attribution_campaign" && campaignStatus == "completed" && updatedAt < $cutoffDate]`,
      { cutoffDate: ninetyDaysAgo }
    );

    for (const campaign of oldCompletedCampaigns) {
      await client.delete(campaign._id);
      console.log(`Deleted old completed campaign: ${campaign._id}`);
    }

    // Clean up cancelled campaigns older than 30 days
    const oldCancelledCampaigns = await client.fetch(
      `*[_type == "attribution_campaign" && campaignStatus == "cancelled" && updatedAt < $cutoffDate]`,
      { cutoffDate: thirtyDaysAgo }
    );

    for (const campaign of oldCancelledCampaigns) {
      await client.delete(campaign._id);
      console.log(`Deleted old cancelled campaign: ${campaign._id}`);
    }

    // Clean up inactive attribution references older than 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const oldInactiveReferences = await client.fetch(
      `*[_type == "attribution_reference" && isActive == false && updatedAt < $cutoffDate]`,
      { cutoffDate: sixtyDaysAgo }
    );

    for (const reference of oldInactiveReferences) {
      await client.delete(reference._id);
      console.log(`Deleted old inactive reference: ${reference._id}`);
    }

    console.log('Cleanup completed successfully!');

  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupOldData();
