import 'dotenv/config'
import { documentEventHandler } from '@sanity/functions'
import { algoliasearch } from "algoliasearch";
// import fetch from 'node-fetch';

// // Set fetch for Node.js environment
// if (typeof global !== 'undefined') {
//   // @ts-ignore
//   global.fetch = fetch;
// }

const ALGOLIA_APP_ID = 'Q2KHY4X8ZQ'
const ALOGIA_WRITE_KEY= 'e553d26d817926d9b2195fc495425e05'

const algolia = algoliasearch(
  ALGOLIA_APP_ID,
  ALOGIA_WRITE_KEY,
  // Overrides the default fetch implementation to use node-fetch
  // {
  //   requester: {
  //     send: async (request) => {
  //       const response = await fetch(request.url, {
  //         method: request.method,
  //         headers: request.headers,
  //         body: request.data
  //       });
  //       return {
  //         status: response.status,
  //         content: await response.text(),
  //         isTimedOut: false,
  //       };
  //     },
  //   },
  // }
);

interface SanityDocument {
  _id: string;
  _type: string;
  slug: string | null;
  store: {
    title: string;
    descriptionHtml: string;
    priceRange: {
      minVariantPrice: number;
      maxVariantPrice: number;
    };
    previewImageUrl: string;
    slug: {
      current: string;
    }
  };
}

export const handler = documentEventHandler(async ({event}) => {
  const time = new Date().toLocaleTimeString()
  console.log(`👋 Your Sanity Function was called at ${time}`)
  console.log('👋 Event:', event)

  const { _id, store } = event.data as SanityDocument
  
  console.log('algolia index', algolia)
  try {
    await algolia.addOrUpdateObject({
      indexName: 'products',
      objectID: _id,
      body: {
        title: store.title,
        // description: store.descriptionHtml,
        // price: store.priceRange,
        // image: store.previewImageUrl,
        // handle: store.slug.current,
      }
    })
  } catch (error) {
    console.error('Error syncing to Algolia:', error)
    throw error
  }
  return
})