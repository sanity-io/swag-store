import 'dotenv/config'
import process from 'node:process'

import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

const { ALGOLIA_APP_ID, ALOGLIA_WRITE_KEY, SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_STORE_URL } = process.env


export default defineBlueprint({
  "resources": [
    defineDocumentFunction({
      name: 'sanity-shopify-product-slug',
      src: 'functions/sanity-shopify-product-slug',
      event: {
        on: ['publish'],
        filter: '_type == "product" && slug.current != store.slug.current'
      }
    }),
    
    defineDocumentFunction({
      name: 'product-ref-map',
      src: 'functions/product-ref-map',
      event: {
        on: ['publish'],
        filter: '_type == "homePage" || _type == "page"'
      }
    }),

    // defineDocumentFunction({
    //   name: 'firstPublished',
    //   src: 'functions/firstPublished',
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "page" && publishedAt == null'
    //   }
    // }),

    // defineDocumentFunction({
    //   name: 'aiSummary',
    //   src: 'functions/aiSummary',
    //   timeout: 30,
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "page" && !defined(autoSummary)'
    //   }
    // }),


    // defineDocumentFunction({
    //   name: 'shopify-image-upload',
    //   src: 'functions/shopify-image-upload',
    //   timeout: 30,
    //   env: {
    //     SHOPIFY_API_KEY: SHOPIFY_API_KEY || '',
    //     SHOPIFY_API_SECRET: SHOPIFY_API_SECRET || '',
    //     SHOPIFY_STORE_URL: SHOPIFY_STORE_URL || ''
    //   },
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "product" && !defined(autoSummary)'
    //   }
    // }),

    // defineDocumentFunction({
    //   name: 'algoliaSync',
    //   src: 'functions/algoliaSync',
    //   env: {
    //     ALGOLIA_APP_ID: ALGOLIA_APP_ID || '',
    //     ALOGLIA_WRITE_KEY: ALOGLIA_WRITE_KEY || ''
    //   },
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "product"'
    //   }
    // })
  ]
})
