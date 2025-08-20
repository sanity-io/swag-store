
import 'dotenv/config'
import process from 'node:process'
import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

const {KLAVIYO_API_KEY, KLAVIYO_LIST_ID} = process.env
if (typeof KLAVIYO_API_KEY !== 'string') {
  throw new Error('KLAVIYO_API_KEY must be set')
}
if (typeof KLAVIYO_LIST_ID !== 'string') {
  throw new Error('KLAVIYO_LIST_ID must be set')
}

export default defineBlueprint({
  "resources": [
    // defineDocumentFunction({
    //   name: 'sanity-shopify-product-slug',
    //   src: 'functions/sanity-shopify-product-slug',
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "product" && slug != store.slug.current'
    //   }
    // }),
    defineDocumentFunction({
      name: 'product-map',
      src: 'functions/product-map',
      event: {
        on: ['publish'],
        filter: '_type == "product"',
        projection: '{_id, store,  _type,colorVariant, productMap}',
      }
    }),
    defineDocumentFunction({
      name: 'marketing-campaign-create',
      src: 'functions/marketing-campaign-create',
      event: {
        on: ['publish'],
        filter: '_type == "post" && !defined(marketingCampaign) && status != "sent"',
        projection: '{_id, _type, title, slug, body, marketingCampaign, klaviyoListId}',
      },
      env: {
        KLAVIYO_API_KEY,
        KLAVIYO_LIST_ID,
      }
    }),
    defineDocumentFunction({
      name: 'marketing-campaign-send',
      src: 'functions/marketing-campaign-send',
      event: {
        on: ['publish'],
        filter: '_type == "marketingCampaign" && status == "ready"',
        projection: '{_id, _type, title, post->, klaviyoCampaignId}',
      },
      env: {
        KLAVIYO_API_KEY,
        KLAVIYO_LIST_ID,
      }
    }),
  ]
})
