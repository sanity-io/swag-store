import { createClient } from '@sanity/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'l3u4li5b',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_WRITE_TOKEN!,
  useCdn: false,
  apiVersion: '2023-05-03'
})

interface CleanupResponse {
  success: boolean
  cleanedCount?: number
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CleanupResponse>
) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  // Optional: Add API key authentication
  const apiKey = req.headers['x-api-key']
  const expectedApiKey = process.env.CLEANUP_API_KEY
  
  if (expectedApiKey && apiKey !== expectedApiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    })
  }

  try {
    const cleanedCount = await cleanupNotifications()
    
    res.status(200).json({
      success: true,
      cleanedCount,
      message: `Successfully cleaned up ${cleanedCount} expired notifications`
    })
  } catch (error) {
    console.error('Error during notification cleanup:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during cleanup'
    })
  }
}

export async function cleanupNotifications(): Promise<number> {
  try {
    // Find expired notifications
    const expiredNotifications = await client.fetch<string[]>(`
      *[_type == "notification" && expiresAt < now()]._id
    `)

    if (expiredNotifications.length === 0) {
      console.log('No expired notifications to clean up')
      return 0
    }

    // Delete expired notifications in batches
    const batchSize = 100
    let totalDeleted = 0

    for (let i = 0; i < expiredNotifications.length; i += batchSize) {
      const batch = expiredNotifications.slice(i, i + batchSize)
      const transaction = client.transaction()
      
      batch.forEach(id => {
        transaction.delete(id)
      })
      
      await transaction.commit()
      totalDeleted += batch.length
      
      console.log(`Deleted batch of ${batch.length} notifications`)
    }

    console.log(`Cleaned up ${totalDeleted} expired notifications`)
    return totalDeleted
    
  } catch (error) {
    console.error('Error during notification cleanup:', error)
    throw error
  }
}
