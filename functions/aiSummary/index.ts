import { documentEventHandler } from '@sanity/functions'
import { createClient } from '@sanity/client'

interface SanityDocument {
  _id: string;
  _type: string;
  body: any;
  autoSummary: any;
}

export const handler = documentEventHandler(async (props) => {
  const { context, event } = props
  console.log('👋 Props:', props)
  const { _id, _type, body, autoSummary } = event.data as SanityDocument

  console.log('👋 Your Sanity Function was called at', new Date().toISOString())

  console.log('👋 ai summary _id:', _id, _type)
  
  if (_type !== 'page') {
    return
  }


  const client = createClient({
    ...context.clientOptions,
    dataset: 'production',
    apiVersion: 'vX',
  })

  await client.agent.action.generate({
    schemaId: "_.schemas.default",
    documentId: _id,
    instruction: 'Write a summary for the article from $body do not include nested module types, just text',
    forcePublishedWrite: true,
    instructionParams: {
      body: {
        type: 'field',
        path: 'body',
      }
    },
    target: {
      path: 'autoSummary',
    },
  })
})