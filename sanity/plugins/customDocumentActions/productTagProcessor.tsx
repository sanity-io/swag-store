import React from 'react'
import {DocumentActionComponent} from 'sanity'
import {TagIcon} from '@sanity/icons'

interface ProductDocument {
  _id: string
  _type: string
  store?: {
    tags?: string[]
  }
  productMap?: {_ref: string}
  colorVariant?: {_ref: string}
}

const ProductTagProcessor: DocumentActionComponent = {
  name: 'process-product-tags',
  title: 'Process Product Tags',
  icon: TagIcon,
  onHandle: async (props) => {
    const {draft, published, client} = props
    const doc = draft || published

    if (!doc || doc._type !== 'product') {
      return
    }

    const productDoc = doc as ProductDocument
    const tags = productDoc.store?.tags

    if (!tags || !Array.isArray(tags)) {
      return {
        label: 'No tags to process',
        tone: 'caution',
      }
    }

    try {
      let productMapRef: string | null = null
      let colorVariantRef: string | null = null

      // Process sanity-parent- tags
      const parentTags = tags.filter((tag) => tag.startsWith('sanity-parent-'))

      for (const tag of parentTags) {
        const productMapName = tag.replace('sanity-parent-', '')

        // Check if productMap already exists
        const existingProductMap = await client.fetch<{
          _id: string
          products?: Array<{_ref: string}>
        } | null>(`*[_type == "productMap" && id == $name][0]`, {name: productMapName})

        if (existingProductMap) {
          // Update existing productMap - append this product to products array
          productMapRef = existingProductMap._id
          await client
            .patch(existingProductMap._id, {
              set: {
                products: [
                  ...(existingProductMap.products || []),
                  {_ref: productDoc._id, _type: 'reference'},
                ],
              },
            })
            .commit()
        } else {
          // Create new productMap
          const newProductMap = await client.create({
            _type: 'productMap',
            id: productMapName,
            products: [{_ref: productDoc._id, _type: 'reference'}],
            description: `Product map for ${productMapName}`,
            careInstructions: [],
          })
          productMapRef = newProductMap._id
        }
      }

      // Process sanity-color- tags
      const colorTags = tags.filter((tag) => tag.startsWith('sanity-color-'))

      for (const tag of colorTags) {
        const colorName = tag.replace('sanity-color-', '')

        // Check if colorVariant already exists
        const existingColorVariant = await client.fetch<{_id: string} | null>(
          `*[_type == "colorVariant" && colorName == $name][0]`,
          {name: colorName},
        )

        if (existingColorVariant) {
          colorVariantRef = existingColorVariant._id
        } else {
          // Create new colorVariant
          const newColorVariant = await client.create({
            _type: 'colorVariant',
            colorName: colorName,
            // colorValue will be set manually or via AI later
          })
          colorVariantRef = newColorVariant._id
        }
      }

      // Update the product document with references
      const updateFields: any = {}

      if (productMapRef) {
        updateFields.productMap = {_ref: productMapRef, _type: 'reference'}
      }

      if (colorVariantRef) {
        updateFields.colorVariant = {_ref: colorVariantRef, _type: 'reference'}
      }

      if (Object.keys(updateFields).length > 0) {
        await client
          .patch(productDoc._id, {
            set: updateFields,
          })
          .commit()
      }

      return {
        label: 'Tags processed successfully',
        tone: 'positive',
      }
    } catch (error) {
      console.error('Error processing product tags:', error)
      return {
        label: 'Error processing tags',
        tone: 'critical',
      }
    }
  },
  hidden: (props) => {
    const {draft, published} = props
    const doc = draft || published
    return doc?._type !== 'product'
  },
}

export default ProductTagProcessor
