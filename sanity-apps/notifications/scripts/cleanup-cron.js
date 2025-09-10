#!/usr/bin/env node

// Cleanup script for expired notifications
// Can be run as a cron job or scheduled function

const https = require('https')
const http = require('http')

const CLEANUP_ENDPOINT = process.env.CLEANUP_ENDPOINT || 'http://localhost:3000/api/notifications/cleanup'
const API_KEY = process.env.CLEANUP_API_KEY

async function runCleanup() {
  return new Promise((resolve, reject) => {
    const url = new URL(CLEANUP_ENDPOINT)
    const isHttps = url.protocol === 'https:'
    const lib = isHttps ? https : http
    
    const postData = JSON.stringify({})
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(API_KEY && { 'x-api-key': API_KEY })
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
          
          if (res.statusCode === 200) {
            console.log(`✅ Cleanup successful: ${result.message}`)
            resolve(result)
          } else {
            console.error(`❌ Cleanup failed (${res.statusCode}): ${result.message}`)
            reject(new Error(`HTTP ${res.statusCode}: ${result.message}`))
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error.message)
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message)
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

// Run cleanup if script is executed directly
if (require.main === module) {
  console.log('🧹 Starting notification cleanup...')
  
  runCleanup()
    .then((result) => {
      console.log(`🎉 Cleanup completed successfully`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Cleanup failed:', error.message)
      process.exit(1)
    })
}

module.exports = { runCleanup }
