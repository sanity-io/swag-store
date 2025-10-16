
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

const {ALGOLIA_APP_ID, ALGOLIA_WRITE_KEY} = process.env
if (typeof ALGOLIA_APP_ID !== 'string' || typeof ALGOLIA_WRITE_KEY !== 'string') {
  throw new Error('ALGOLIA_APP_ID and ALGOLIA_WRITE_KEY must be set')
}

export default defineBlueprint({
  "resources": [
    // Not currently running but here for example/reference
    // defineDocumentFunction({
    //   name: 'algolia-sync',
    //   src: 'functions/algolia-sync',
    //   event: {
    //     on: ['create', 'update', 'delete'],
    //     filter: "_type == 'product'",
    //     projection: '{_id, title, hideFromSearch, "operation": delta::operation()}',
    //   },
    //   env: {
    //     ALGOLIA_APP_ID,
    //     ALGOLIA_WRITE_KEY,
    //   }
    // }),
    // defineDocumentFunction({
    //   name: 'product-map',
    //   src: 'functions/product-map',
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "product"',
    //     projection: '{_id, store,  _type,colorVariant, productMap}',
    //   }
    // }),
    defineDocumentFunction({
      name: 'sanity-shopify-product-slug',
      src: 'functions/sanity-shopify-product-slug',
      event: {
        on: ['create', 'update'],
        filter: '_type == "product" && delta::changed("store.slug.current") && slug != null',
        projection: '{_id, _type, slug, store}',
      },
    }),
    defineDocumentFunction({
      name: 'stale-products',
      src: 'functions/stale-products',
      event: {
        on: ['create', 'update'],
        filter: '_type == "home" && delta::changedAny(modules)',
        projection: '{_id, _type, "operation": delta::operation()}',
      },
    }),
    defineDocumentFunction({
      name: 'marketing-campaign-create',
      src: 'functions/marketing-campaign-create',
      event: {
        on: ['create', 'update'],
        filter: '_type == "post" && status != "sent"',
        projection: '{_id, _type, title, slug, body, marketingCampaign, klaviyoListId, "operation": delta::operation()}',
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
        projection: '{_id, _type, title, post, klaviyoCampaignId}',
      },
      env: {
        KLAVIYO_API_KEY,
        KLAVIYO_LIST_ID,
      }
    }),
  ]
})
