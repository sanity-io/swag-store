
import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

export default defineBlueprint({
  "resources": [
    defineDocumentFunction({
      name: 'sanity-shopify-product-slug',
      src: 'functions/sanity-shopify-product-slug',
      event: {
        on: ['publish'],
        filter: '_type == "product" && slug != store.slug.current'
      }
    }),
    defineDocumentFunction({
      name: 'product-map',
      src: 'functions/product-map',
      event: {
        on: ['publish'],
        filter: '_type == "product"'
      }
    }),
  ]
})
