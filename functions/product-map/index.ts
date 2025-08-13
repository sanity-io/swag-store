import { documentEventHandler, type DocumentEvent } from '@sanity/functions'
import { createClient } from '@sanity/client'

interface ShopifyPayload {
  _id: string;
  _type: string;
  store?: {
    tags?: string[];
    slug?: {
      current: string;
    };
  };
}

interface ProductMapDocument {
  _id: string;
  id: string;
  products?: Array<{ _ref: string }>;
}

interface ColorVariantDocument {
  _id: string;
  colorName: string;
  colorValue?: {
    hex: string;
  };
}

export const handler = documentEventHandler(async ({ context, event}: { context: any, event: DocumentEvent<ShopifyPayload> }) => {
  console.log('👋 Your Sanity Function was called at', new Date().toISOString())
  console.log('👋 Event:', event)
  
  try {
    const { _id, _type, store } = event.data as ShopifyPayload

    if (_type !== 'product') {
      console.log('⏭️ Skipping non-product document:', _type)
      return
    }

    if (!store?.tags || !Array.isArray(store.tags)) {
      console.log('⏭️ No tags found for product:', _id)
      return
    }

    console.log('🏷️ Processing tags for product:', _id, 'Tags:', store.tags)

    const client = createClient({
      ...context.clientOptions,
      dataset: 'production',
      apiVersion: '2025-06-01',
    })

    let productMapRef: string | null = null
    let colorVariantRef: string | null = null

    // Process sanity-parent- tags
    const parentTags = store.tags.filter(tag => tag.startsWith('sanity-parent-'))
    console.log('📦 Processing parent tags:', parentTags)
    
    for (const tag of parentTags) {
      const productMapName = tag.replace('sanity-parent-', '')
      console.log('🔄 Processing parent tag:', tag, '-> ProductMap:', productMapName)
      
      // Check if productMap already exists
      const existingProductMap = await client.fetch<{ _id: string; products?: Array<{ _ref: string }> } | null>(
        `*[_type == "productMap" && id == $name][0]`,
        { name: productMapName }
      )

      if (existingProductMap) {
        // Update existing productMap - append this product to products array
        productMapRef = existingProductMap._id
        console.log('📝 Updating existing productMap:', productMapName, 'with product:', _id)
        await client.patch(existingProductMap._id, {
          set: {
            products: [
              ...(existingProductMap.products || []),
              { _ref: _id, _type: 'reference' }
            ]
          }
        }).commit()
      } else {
        // Create new productMap
        console.log('🆕 Creating new productMap:', productMapName)
        const newProductMap = await client.create({
          _type: 'productMap',
          id: productMapName,
          products: [{ _ref: _id, _type: 'reference' }],
          description: `Product map for ${productMapName}`,
          careInstructions: []
        })
        productMapRef = newProductMap._id
        console.log('✅ Created productMap:', productMapName, 'with ID:', newProductMap._id)
      }
    }

    // Process sanity-color- tags
    const colorTags = store.tags.filter(tag => tag.startsWith('sanity-color-'))
    console.log('🎨 Processing color tags:', colorTags)
    
    for (const tag of colorTags) {
      const colorName = tag.replace('sanity-color-', '')
      console.log('🔄 Processing color tag:', tag, '-> Color:', colorName)
      
      // Check if colorVariant already exists
      const existingColorVariant = await client.fetch<{ _id: string } | null>(
        `*[_type == "colorVariant" && colorName == $name][0]`,
        { name: colorName }
      )

      if (existingColorVariant) {
        colorVariantRef = existingColorVariant._id
        console.log('📝 Using existing colorVariant:', colorName, 'ID:', existingColorVariant._id)
      } else {
        // Create new colorVariant
        // Note: AI color assignment would go here, but for now we'll create without colorValue
        console.log('🆕 Creating new colorVariant:', colorName)
        const newColorVariant = await client.create({
          _type: 'colorVariant',
          colorName: colorName,
          // colorValue will be set manually or via AI later
        })
        colorVariantRef = newColorVariant._id
        console.log('✅ Created colorVariant:', colorName, 'with ID:', newColorVariant._id)
      }
    }

    // Update the product document with references
    const updateFields: any = {}
    
    if (productMapRef) {
      updateFields.productMap = { _ref: productMapRef, _type: 'reference' }
    }
    
    if (colorVariantRef) {
      updateFields.colorVariant = { _ref: colorVariantRef, _type: 'reference' }
    }

    if (Object.keys(updateFields).length > 0) {
      console.log('🔄 Updating product with references:', updateFields)
      await client.patch(_id, {
        set: updateFields
      }).commit()
      console.log('✅ Product updated successfully')
    } else {
      console.log('ℹ️ No references to update for product')
    }

    console.log('✅ Product processing completed:', {
      productId: _id,
      productMapRef,
      colorVariantRef
    })
  } catch (error) {
    console.error('❌ Error processing product:', error)
    throw error
  }
})