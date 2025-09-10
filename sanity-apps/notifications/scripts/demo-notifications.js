#!/usr/bin/env node

// Demo script to create sample notifications for testing
// Usage: node scripts/demo-notifications.js [endpoint]

const https = require('https')
const http = require('http')

const ENDPOINT = process.argv[2] || 'http://localhost:3000/api/notifications/create'

const sampleNotifications = [
  {
    title: "Welcome to Notifications!",
    message: "Your notification system is now set up and working correctly. This is a test notification to verify everything is functioning properly.",
    status: "success",
    source: "Demo Script",
    metadata: {
      type: "welcome",
      version: "1.0.0"
    }
  },
  {
    title: "Document Published",
    message: "The 'About Us' page has been successfully published and is now live on the website.",
    status: "success",
    source: "Content Management",
    metadata: {
      documentId: "about-us-123",
      action: "publish",
      userId: "editor-456"
    }
  },
  {
    title: "API Rate Limit Warning",
    message: "The external API integration is approaching its rate limit. Consider implementing caching or upgrading your plan.",
    status: "warning",
    source: "API Monitor",
    metadata: {
      currentUsage: 850,
      limit: 1000,
      resetTime: "2024-01-01T00:00:00Z"
    }
  },
  {
    title: "Build Deployment Failed",
    message: "The latest deployment failed due to a compilation error in the checkout component. Please review the build logs.",
    status: "error",
    source: "CI/CD Pipeline",
    metadata: {
      buildId: "build-789",
      branch: "main",
      commitHash: "abc123def456"
    }
  },
  {
    title: "Scheduled Backup Complete",
    message: "Daily backup of the production database completed successfully. All data has been safely stored.",
    status: "success",
    source: "Backup Service",
    metadata: {
      backupSize: "2.3GB",
      duration: "45 minutes",
      location: "s3://backups/daily"
    }
  },
  {
    title: "Security Alert",
    message: "Multiple failed login attempts detected from IP address 192.168.1.100. Account has been temporarily locked.",
    status: "error",
    source: "Security Monitor",
    metadata: {
      ipAddress: "192.168.1.100",
      attempts: 5,
      accountId: "user-999"
    }
  }
]

async function createNotification(notification) {
  return new Promise((resolve, reject) => {
    const url = new URL(ENDPOINT)
    const isHttps = url.protocol === 'https:'
    const lib = isHttps ? https : http
    
    const postData = JSON.stringify(notification)
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = lib.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          
          if (res.statusCode === 201) {
            console.log(`✅ Created: ${notification.title}`)
            resolve(result)
          } else {
            console.error(`❌ Failed to create "${notification.title}": ${result.message}`)
            reject(new Error(`HTTP ${res.statusCode}: ${result.message}`))
          }
        } catch (error) {
          console.error(`❌ Failed to parse response for "${notification.title}":`, error.message)
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      console.error(`❌ Request failed for "${notification.title}":`, error.message)
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function createDemoNotifications() {
  console.log(`🚀 Creating ${sampleNotifications.length} demo notifications...`)
  console.log(`📡 Endpoint: ${ENDPOINT}`)
  console.log('')

  let successCount = 0
  let failCount = 0

  for (const notification of sampleNotifications) {
    try {
      await createNotification(notification)
      successCount++
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      failCount++
    }
  }

  console.log('')
  console.log(`🎉 Demo complete!`)
  console.log(`✅ Successfully created: ${successCount} notifications`)
  if (failCount > 0) {
    console.log(`❌ Failed to create: ${failCount} notifications`)
  }
  console.log('')
  console.log('Visit your Sanity Studio notification app to see the results!')
}

// Run the demo if script is executed directly
if (require.main === module) {
  createDemoNotifications()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Demo failed:', error.message)
      process.exit(1)
    })
}

module.exports = { createDemoNotifications, sampleNotifications }
