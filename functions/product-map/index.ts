import { documentEventHandler, type DocumentEvent } from '@sanity/functions'
import { createClient } from '@sanity/client'

interface SanityDocument {
  _id: string;
  _type: string;
  slug: string | null;
  store?: {
    slug: {
      current: string;
    };
  };
}

export const handler = documentEventHandler(async ({ context, event}: { context: any, event: DocumentEvent<SanityDocument> }) => {
  console.log('👋 Your Sanity Function was called at', new Date().toISOString())
  console.log('👋 Event:', event)
  const { _id, _type, slug, store } = event.data as SanityDocument

  if (_type !== 'product' && slug !== null) {
    return
  }

  if (!store?.slug?.current) {
    return
  }

  const client = createClient({
    ...context.clientOptions,
    dataset: 'production',
    apiVersion: '2025-06-01',
  })
  client.patch(_id, {
    set: {
      slug: store.slug.current,
    },
  }).commit()
})