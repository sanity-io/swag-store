
import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

export default defineBlueprint({
  "resources": [
    defineDocumentFunction({
      name: 'product-map',
      src: 'functions/product-map',
      event: {
        on: ['publish'],
        filter: '_type == "product"',
        projection: '{_id, store, colorVariant, productMap}',
      }
    }),
  ]
})
