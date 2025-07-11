
import process from 'node:process'
import { documentEventHandler } from '@sanity/functions'
import { algoliasearch } from "algoliasearch";

const { ALGOLIA_APP_ID, ALOGLIA_WRITE_KEY } = process.env

interface SanityProductDocument {
  _id: string;
  _type: string;
  slug: string | null;
  store: {
    title: string;
  };
}

export const handler = documentEventHandler(async ({event}) => {
  const time = new Date().toLocaleTimeString()
  console.log(`👋 Your Sanity Function was called at ${time}`)
  console.log('👋 Event:', event)

  const { _id, store } = event.data as SanityProductDocument
  
  const algolia = algoliasearch(
    ALGOLIA_APP_ID || '',
    ALOGLIA_WRITE_KEY || ''
  );
  
  try {
    await algolia.addOrUpdateObject({
      indexName: 'products',
      objectID: _id,
      body: {
        title: store.title,
      }
    })
  } catch (error) {
    console.error('Error syncing to Algolia:', error)
    throw error
  }
  return
})