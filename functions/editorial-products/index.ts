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
  const { _id } = event.data as DocumentEvent<SanityDocument>


  const client = createClient({
    ...context.clientOptions,
    dataset: 'production',
    apiVersion: 'vX',
    useCdn: false,
  })

  console.log('👋 _id:', _id)

  try {
    // const firstThis = await client.agent.action.generate({
    //   schemaId: "_.schemas.default",
    //   documentId: _id,
    //   instruction: 'Read the contents of the $content and find product names and add them to the productTest',
    //   forcePublishedWrite: true,
    //   instructionParams: {
    //     content: {
    //       type: 'field',
    //       path: 'body',
    //     },
    //   },
    //   target: {
    //     path: 'productTest',
    //   },
    // })


    const result = await client.agent.action.generate({
      schemaId: "_.schemas.default",
      documentId: _id,
      instruction: 'Read the contents of the $content and search for product references, if you find any, add them to the autoSummary array, you should read from the $allProducts array',
      forcePublishedWrite: true,
      instructionParams: {
        content: {
          type: 'field',
          path: 'body',
        },
        allProducts: {
          type: 'groq',
          query: "*[_type == 'product']{title, slug}",
          params: {
            id: _id,
          },
        },
      },
      target: {
        path: 'autoSummary',
      },
    })
    console.log('👋 Result:', result)
  } catch (error) {
    console.error('👋 Error:', error)
  }
})