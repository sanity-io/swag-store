// Example: Creating notifications from external systems

// Basic notification creation
async function createNotification(title, message, status = 'success') {
  const response = await fetch('https://your-domain.com/api/notifications/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      message,
      status,
      source: 'External System',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })
  })
  
  const result = await response.json()
  console.log('Notification created:', result)
  return result
}

// Example usage scenarios:

// 1. Document update notification
createNotification(
  'Document Updated',
  'The homepage content has been successfully updated and published.',
  'success'
)

// 2. Error notification
createNotification(
  'Build Failed',
  'The deployment build failed due to a compilation error in the main component.',
  'error'
)

// 3. Warning notification
createNotification(
  'API Rate Limit Warning',
  'The external API is approaching rate limits. Consider implementing caching.',
  'warning'
)

// 4. Integration with Sanity Functions
export default async function sanityFunction(req, context) {
  try {
    // Your function logic here
    const result = await processContent(context.document)
    
    // Send success notification
    await createNotification(
      'Function Executed Successfully',
      `Content processing completed for "${context.document?.title}"`,
      'success'
    )
    
    return { success: true, result }
  } catch (error) {
    // Send error notification
    await createNotification(
      'Function Execution Failed',
      `Error processing "${context.document?.title}": ${error.message}`,
      'error'
    )
    
    throw error
  }
}

// 5. Batch notification creation
async function createBatchNotifications(notifications) {
  const results = await Promise.allSettled(
    notifications.map(notification => createNotification(
      notification.title,
      notification.message,
      notification.status
    ))
  )
  
  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  console.log(`Batch complete: ${successful} successful, ${failed} failed`)
  return results
}

// Example batch usage
const batchNotifications = [
  { title: 'User Registration', message: 'New user registered: john@example.com', status: 'success' },
  { title: 'Payment Processed', message: 'Payment of $99.99 processed successfully', status: 'success' },
  { title: 'Inventory Low', message: 'Product XYZ is running low on inventory', status: 'warning' }
]

// createBatchNotifications(batchNotifications)
