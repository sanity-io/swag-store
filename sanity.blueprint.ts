import 'dotenv/config'
import process from 'node:process'

import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

// const { ALGOLIA_APP_ID, ALOGLIA_WRITE_KEY, SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_STORE_URL } = process.env


export default defineBlueprint({
  "resources": [
    // defineDocumentFunction({
    //   name: 'editorial-product-mapping',
    //   src: 'functions/editorial-product-mapping',
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "post" && !defined(products)'
    //   }
    // }),
    defineDocumentFunction({
      name: 'sanity-shopify-product-slug',
      src: 'functions/sanity-shopify-product-slug',
      event: {
        on: ['publish'],
        filter: '_type == "product" && slug != store.slug.current'
      }
    }),
    
    // defineDocumentFunction({
    //   name: 'product-ref-map',
    //   src: 'functions/product-ref-map',
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "homePage" || _type == "page"'
    //   }
    // }),

    // defineDocumentFunction({
    //   name: 'editorial-products',
    //   src: 'functions/editorial-products',
    //   timeout: 30,
    //   event: {
    //     on: ['publish'],
    //     filter: '_type == "page"'
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

  ]
})
