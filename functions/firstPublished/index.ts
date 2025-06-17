import { documentEventHandler } from '@sanity/functions'
import { createClient } from '@sanity/client'

interface SanityDocument {
  _id: string;
  _type: string;
  publishedAt: string | null;
}

export const handler = documentEventHandler(async ({ context, event }) => {
  console.log('👋 Your Sanity Function was called at', new Date().toISOString())
  console.log('👋 Event:', event)
  const { _id, _type, publishedAt } = event as unknown as SanityDocument

  // Only run for pages that have been published
  if (_type !== 'page' && publishedAt !== null) {
    return
  }

  const client = createClient({
    ...context.clientOptions,
    dataset: 'production',
    apiVersion: '2025-06-01',
  })

  let tx = client.transaction()

  tx = tx.patch(_id, {
    set: {
      publishedAt: new Date().toISOString(),
    },
  })

  await tx.commit()
})