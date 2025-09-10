import { createClient } from '@sanity/client'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_WRITE_TOKEN!,
  useCdn: false,
  apiVersion: '2023-05-03'
})

interface NotificationPayload {
  title: string
  message: string
  status?: 'success' | 'warning' | 'error'
  source?: string
  metadata?: {
    documentId?: string
    action?: string
    userId?: string
    [key: string]: any
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Verify webhook signature if secret is provided
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = req.headers[SIGNATURE_HEADER_NAME]
    const body = JSON.stringify(req.body)
    
    if (!(await isValidSignature(body, signature as string, webhookSecret))) {
      return res.status(401).json({ message: 'Invalid signature' })
    }
  }

  try {
    const { title, message, status = 'success', source, metadata }: NotificationPayload = req.body

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ 
        message: 'Title and message are required' 
      })
    }

    // Validate status
    if (!['success', 'warning', 'error'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be one of: success, warning, error' 
      })
    }

    // Create notification document
    const notification = await client.create({
      _type: 'notification',
      title,
      message,
      status,
      source,
      metadata,
      isRead: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    })

    res.status(201).json({ 
      success: true, 
      notificationId: notification._id 
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}
