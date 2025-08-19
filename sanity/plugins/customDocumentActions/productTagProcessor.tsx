import React, {useState} from 'react'
import {TagIcon} from '@sanity/icons'
import {Stack, Text, useToast} from '@sanity/ui'
import {type DocumentActionDescription, useClient} from 'sanity'
import type {ShopifyDocument, ShopifyDocumentActionProps} from './types'
import {SANITY_API_VERSION} from '../../constants'

export default (props: ShopifyDocumentActionProps): DocumentActionDescription | undefined => {
  const {draft, onComplete, type, published} = props

  const [dialogOpen, setDialogOpen] = useState(false)
  const toast = useToast()
  const client = useClient({apiVersion: SANITY_API_VERSION})

  if (type !== 'product') {
    return
  }

  const productDoc = (draft || published) as ShopifyDocument
  const rawTags = productDoc.store?.tags

  // Handle tags that might come as a string or array
  let tags: string[] = []
  if (rawTags) {
    if (Array.isArray(rawTags)) {
      tags = rawTags
    } else if (typeof rawTags === 'string') {
      // Split comma-separated tags and trim whitespace
      tags = rawTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    }
  }

  // If no tags, still show the action but disabled
  if (!rawTags || tags.length === 0) {
    return {
      tone: 'caution',
      icon: TagIcon,
      label: 'No tags to process',
      disabled: true,
    }
  }

  const handleProcessTags = async () => {
    try {
      let productMapRef: string | null = null
      let colorVariantRef: string | null = null

      // Process sanity-parent- tags
      const parentTags = tags.filter((tag) => tag.startsWith('sanity-parent-'))

      for (const tag of parentTags) {
        const productMapName = tag.replace('sanity-parent-', '')
        const productMapId = `productMap-${productMapName}`

        // Check if productMap already exists by _id
        const existingProductMap = await client.fetch<{
          _id: string
          products?: Array<{_ref: string}>
        } | null>(`*[_id == $id][0]`, {id: productMapId})

        if (existingProductMap) {
          // Update existing productMap - append this product to products array
          productMapRef = existingProductMap._id

          // Check if product already exists in the products array
          const existingProducts = existingProductMap.products || []
          const productAlreadyExists = existingProducts.some(
            (product) => product._ref === productDoc._id,
          )

          if (!productAlreadyExists) {
            await client
              .patch(existingProductMap._id, {
                set: {
                  products: [
                    ...existingProducts,
                    {
                      _key: `product-${productDoc._id}-${Date.now()}`,
                      _ref: productDoc._id,
                      _type: 'reference',
                    },
                  ],
                },
              })
              .commit()
          } else {
            console.log('Product already exists in productMap, skipping duplicate')
          }
        } else {
          // Create new productMap with specific _id
          const newProductMap = await client.create({
            _id: productMapId,
            _type: 'productMap',
            id: productMapName,
            products: [
              {_key: `product-${productDoc._id}`, _ref: productDoc._id, _type: 'reference'},
            ],
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
        const colorVariantId = `colorVariant-${colorName}`

        // Check if colorVariant already exists by _id
        const existingColorVariant = await client.fetch<{_id: string} | null>(`*[_id == $id][0]`, {
          id: colorVariantId,
        })

        if (existingColorVariant) {
          colorVariantRef = existingColorVariant._id
        } else {
          // Create new colorVariant with specific _id
          const newColorVariant = await client.create({
            _id: colorVariantId,
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

      toast.push({
        status: 'success',
        title: 'Tags processed successfully',
      })

      onComplete()
    } catch (error) {
      console.error('Error processing product tags:', error)
      toast.push({
        status: 'error',
        title: 'Error processing tags',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    tone: 'primary',
    icon: TagIcon,
    label: `Process Tags (${tags.length})`,
    onHandle: handleProcessTags,
  }
}
