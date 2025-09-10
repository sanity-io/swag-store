#!/usr/bin/env node

/**
 * Test script for the Sanity Notification System
 * 
 * This script demonstrates how to create notifications via the webhook API
 * and can be used for testing the notification system.
 */

const fetch = require('node-fetch')

// Configuration - update these values for your setup
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/notification-webhook'
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test-secret'

// Test notifications
const testNotifications = [
  {
    title: 'Welcome to the Notification System!',
    message: 'This is a test notification to verify that the system is working correctly.',
    status: 'success',
    source: 'Test Script',
    metadata: {
      testId: 'welcome-001',
      action: 'test',
      userId: 'test-user'
    }
  },
  {
    title: 'System Maintenance Scheduled',
    message: 'The system will be under maintenance from 2:00 AM to 4:00 AM UTC tomorrow.',
    status: 'warning',
    source: 'System Monitor',
    metadata: {
      maintenanceId: 'maint-2024-001',
      action: 'maintenance',
      scheduledTime: '2024-01-15T02:00:00Z'
    }
  },
  {
    title: 'Database Connection Failed',
    message: 'Unable to connect to the primary database. Fallback systems are active.',
    status: 'error',
    source: 'Database Monitor',
    metadata: {
      errorCode: 'DB_CONN_001',
      action: 'error',
      severity: 'high',
      affectedServices: ['api', 'webhook']
    }
  },
  {
    title: 'New User Registration',
    message: 'A new user has registered: john.doe@example.com',
    status: 'success',
    source: 'User Management',
    metadata: {
      userId: 'user-12345',
      action: 'registration',
      email: 'john.doe@example.com',
      registrationTime: new Date().toISOString()
    }
  },
  {
    title: 'Content Published',
    message: 'The homepage has been successfully published and is now live.',
    status: 'success',
    source: 'Content Management',
    metadata: {
      documentId: 'homepage-2024',
      action: 'publish',
      publishedBy: 'editor-001',
      publishedAt: new Date().toISOString()
    }
  }
]

async function createNotification(notification) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sanity-Signature': WEBHOOK_SECRET // In production, this should be a proper signature
      },
      body: JSON.stringify(notification)
    })

    const result = await response.json()

    if (response.ok) {
      console.log(`✅ Created notification: "${notification.title}" (ID: ${result.notificationId})`)
    } else {
      console.error(`❌ Failed to create notification: "${notification.title}"`)
      console.error(`   Error: ${result.message}`)
    }
  } catch (error) {
    console.error(`❌ Error creating notification: "${notification.title}"`)
    console.error(`   ${error.message}`)
  }
}

async function testNotificationSystem() {
  console.log('🚀 Starting Sanity Notification System Test\n')
  console.log(`📡 Webhook URL: ${WEBHOOK_URL}`)
  console.log(`🔐 Using secret: ${WEBHOOK_SECRET ? 'Yes' : 'No'}\n`)

  // Test each notification
  for (let i = 0; i < testNotifications.length; i++) {
    const notification = testNotifications[i]
    console.log(`📝 Creating notification ${i + 1}/${testNotifications.length}...`)
    await createNotification(notification)
    
    // Add a small delay between requests
    if (i < testNotifications.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('\n✨ Test completed!')
  console.log('📱 Check your Sanity Studio to see the notifications in the Notifications section.')
  console.log('🔗 The notifications should appear in the Studio sidebar under "Notifications".')
}

// Run the test
if (require.main === module) {
  testNotificationSystem().catch(console.error)
}

module.exports = { testNotificationSystem, createNotification, testNotifications }
