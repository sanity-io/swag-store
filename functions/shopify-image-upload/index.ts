import process from 'node:process'
import { documentEventHandler } from '@sanity/functions'
import axios from 'axios'

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_STORE_URL } = process.env

export const handler = documentEventHandler(async ({ context, event }) => {
  const time = new Date().toLocaleTimeString()
  console.log(`👋 Your Sanity Function was called at ${time}`)

  const { image } = event.data

  console.log(image)
})


