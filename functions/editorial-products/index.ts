import { documentEventHandler, type DocumentEvent } from '@sanity/functions'
import { createClient } from '@sanity/client'

interface SanityDocument {
  _id: string;
  _type: string;
  body: any;
  autoProducts: Array<{
    _type: string;
    _ref: string;
  }>;
}

export const handler = documentEventHandler(async (props) => {
  const { context, event } = props
  console.log('👋 Your Sanity Function was called at', new Date().toISOString())
  console.log('👋 Event:', props)
  const { data } = event as DocumentEvent<SanityDocument>


  const client = createClient({
    ...context.clientOptions,
    dataset: 'production',
    apiVersion: 'vX',
  })

  try {
    const result = await client.agent.action.generate({
      schemaId: "_.schemas.default",
      documentId: data._id,
      instruction: 'Read the contents of the $content and search for product references, if you find any, add them to the autoProducts array',
      forcePublishedWrite: true,
      instructionParams: {
        content: {
          type: 'field',
          path: 'body',
        }
      },
      target: {
        path: 'autoProducts',
      },
    })
    console.log('👋 Result:', result)
  } catch (error) {
    console.error('👋 Error:', error)
  }
})