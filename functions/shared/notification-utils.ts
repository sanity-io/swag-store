import { createClient } from '@sanity/client'

interface NotificationPayload {
  title: string
  message: string
  status: 'success' | 'warning' | 'error'
  source: string
  metadata?: {
    documentId?: string
    action?: string
    userId?: string
    [key: string]: any
  }
}

export async function createNotification(
  client: any,
  payload: NotificationPayload
): Promise<void> {
  try {
    const notification = await client.create({
      _type: 'notification',
      title: payload.title,
      message: payload.message,
      status: payload.status,
      source: payload.source,
      metadata: payload.metadata,
      isRead: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      createdAt: new Date().toISOString()
    })

    console.log('✅ Notification created:', notification._id)
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    // Don't throw error to avoid breaking the main function
  }
}

export async function createMarketingCampaignNotification(
  client: any,
  type: 'create' | 'update' | 'send' | 'error',
  postTitle: string,
  campaignId?: string,
  error?: string
): Promise<void> {
  let notification: NotificationPayload

  switch (type) {
    case 'create':
      notification = {
        title: 'Marketing Campaign Created',
        message: `Successfully created marketing campaign for "${postTitle}"`,
        status: 'success',
        source: 'marketing-campaign-create',
        metadata: {
          documentId: campaignId,
          action: 'create',
          postTitle
        }
      }
      break

    case 'update':
      notification = {
        title: 'Marketing Campaign Updated',
        message: `Successfully updated marketing campaign template for "${postTitle}"`,
        status: 'success',
        source: 'marketing-campaign-create',
        metadata: {
          documentId: campaignId,
          action: 'update',
          postTitle
        }
      }
      break

    case 'send':
      notification = {
        title: 'Marketing Campaign Sent',
        message: `Successfully sent marketing campaign for "${postTitle}" to subscribers`,
        status: 'success',
        source: 'marketing-campaign-send',
        metadata: {
          documentId: campaignId,
          action: 'send',
          postTitle
        }
      }
      break

    case 'error':
      notification = {
        title: 'Marketing Campaign Error',
        message: `Failed to process marketing campaign for "${postTitle}": ${error || 'Unknown error'}`,
        status: 'error',
        source: 'marketing-campaign-create',
        metadata: {
          documentId: campaignId,
          action: 'error',
          postTitle,
          error: error || 'Unknown error'
        }
      }
      break

    default:
      return
  }

  await createNotification(client, notification)
}
