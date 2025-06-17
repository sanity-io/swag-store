import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

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
      name: 'firstPublished',
      src: 'functions/firstPublished',
      event: {
        on: ['publish'],
        filter: '_type == "page" && publishedAt == null'
      }
    }),

    defineDocumentFunction({
      name: 'aiSummary',
      src: 'functions/aiSummary',
      timeout: 30,
      event: {
        on: ['publish'],
        filter: '_type == "page" && !defined(autoSummary)'
      }
    }),

    defineDocumentFunction({
      name: 'algoliaSync',
      src: 'functions/algoliaSync',
      event: {
        on: ['publish'],
        filter: '_type == "product"'
      }
    })
  ]
})
