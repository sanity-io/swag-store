// Test script to demonstrate marketing campaign notifications
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'l3u4li5b',
  dataset: 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
})

async function createTestNotifications() {
  console.log('🧪 Creating test marketing campaign notifications...')

  const notifications = [
    {
      _type: 'notification',
      title: 'Marketing Campaign Created',
      message: 'Successfully created marketing campaign for "New Product Launch"',
      status: 'success',
      source: 'marketing-campaign-create',
      metadata: {
        documentId: 'marketingCampaign-test123',
        action: 'create',
        postTitle: 'New Product Launch'
      },
      isRead: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      _type: 'notification',
      title: 'Marketing Campaign Updated',
      message: 'Successfully updated marketing campaign template for "Summer Sale"',
      status: 'success',
      source: 'marketing-campaign-create',
      metadata: {
        documentId: 'marketingCampaign-test456',
        action: 'update',
        postTitle: 'Summer Sale'
      },
      isRead: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      _type: 'notification',
      title: 'Marketing Campaign Sent',
      message: 'Successfully sent marketing campaign for "Holiday Collection" to 1,250 subscribers',
      status: 'success',
      source: 'marketing-campaign-send',
      metadata: {
        documentId: 'marketingCampaign-test789',
        action: 'send',
        postTitle: 'Holiday Collection',
        subscriberCount: 1250
      },
      isRead: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      _type: 'notification',
      title: 'Marketing Campaign Error',
      message: 'Failed to create marketing campaign for "Black Friday Deals": Klaviyo API rate limit exceeded',
      status: 'error',
      source: 'marketing-campaign-create',
      metadata: {
        documentId: 'marketingCampaign-test999',
        action: 'error',
        postTitle: 'Black Friday Deals',
        error: 'Klaviyo API rate limit exceeded'
      },
      isRead: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ]

  try {
    for (const notification of notifications) {
      const result = await client.create(notification)
      console.log(`✅ Created notification: ${result._id} - ${notification.title}`)
    }
    
    console.log('🎉 All test notifications created successfully!')
    console.log('📱 Check your Sanity Studio to see the notifications in the notification system app.')
    
  } catch (error) {
    console.error('❌ Error creating test notifications:', error)
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  createTestNotifications()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}

module.exports = { createTestNotifications }
