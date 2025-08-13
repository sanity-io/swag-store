import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {createClient} from '@sanity/client';

interface ShopifyWebhookPayload {
  id: number;
  title: string;
  tags: string[];
  variants: Array<{
    id: number;
    title: string;
    option1?: string;
    option2?: string;
    option3?: string;
  }>;
}

export async function action({request}: {request: Request}) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const body = await request.text();
    const payload: ShopifyWebhookPayload = JSON.parse(body);

    // Verify this is a product webhook (you might want to add Shopify webhook verification here)
    if (!payload.tags || !Array.isArray(payload.tags)) {
      return json({error: 'Invalid payload'}, {status: 400});
    }

    // Initialize Sanity client
    const client = createClient({
      projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID',
      dataset: process.env.SANITY_STUDIO_DATASET || 'production',
      apiVersion: '2025-06-01',
      token: process.env.SANITY_API_TOKEN, // You'll need to add this to your environment variables
      useCdn: false,
    });

    // Find the corresponding Sanity product document
    const sanityProduct = await client.fetch<{_id: string} | null>(
      `*[_type == "product" && store.id == $shopifyId][0]`,
      {shopifyId: payload.id.toString()},
    );

    if (!sanityProduct) {
      console.log('No Sanity product found for Shopify ID:', payload.id);
      return json({message: 'Product not found in Sanity'});
    }

    let productMapRef: string | null = null;
    let colorVariantRef: string | null = null;

    // Process sanity-parent- tags
    const parentTags = payload.tags.filter((tag) =>
      tag.startsWith('sanity-parent-'),
    );
    console.log('Processing parent tags:', parentTags);

    for (const tag of parentTags) {
      const productMapName = tag.replace('sanity-parent-', '');

      // Check if productMap already exists
      const existingProductMap = await client.fetch<{
        _id: string;
        products?: Array<{_ref: string}>;
      } | null>(`*[_type == "productMap" && id == $name][0]`, {
        name: productMapName,
      });

      if (existingProductMap) {
        // Update existing productMap - append this product to products array
        productMapRef = existingProductMap._id;
        await client
          .patch(existingProductMap._id, {
            set: {
              products: [
                ...(existingProductMap.products || []),
                {_ref: sanityProduct._id, _type: 'reference'},
              ],
            },
          })
          .commit();
      } else {
        // Create new productMap
        const newProductMap = await client.create({
          _type: 'productMap',
          id: productMapName,
          products: [{_ref: sanityProduct._id, _type: 'reference'}],
          description: `Product map for ${productMapName}`,
          careInstructions: [],
        });
        productMapRef = newProductMap._id;
      }
    }

    // Process sanity-color- tags
    const colorTags = payload.tags.filter((tag) =>
      tag.startsWith('sanity-color-'),
    );
    console.log('Processing color tags:', colorTags);

    for (const tag of colorTags) {
      const colorName = tag.replace('sanity-color-', '');

      // Check if colorVariant already exists
      const existingColorVariant = await client.fetch<{_id: string} | null>(
        `*[_type == "colorVariant" && colorName == $name][0]`,
        {name: colorName},
      );

      if (existingColorVariant) {
        colorVariantRef = existingColorVariant._id;
      } else {
        // Create new colorVariant
        const newColorVariant = await client.create({
          _type: 'colorVariant',
          colorName: colorName,
          // colorValue will be set manually or via AI later
        });
        colorVariantRef = newColorVariant._id;
      }
    }

    // Update the product document with references
    const updateFields: any = {};

    if (productMapRef) {
      updateFields.productMap = {_ref: productMapRef, _type: 'reference'};
    }

    if (colorVariantRef) {
      updateFields.colorVariant = {_ref: colorVariantRef, _type: 'reference'};
    }

    if (Object.keys(updateFields).length > 0) {
      await client
        .patch(sanityProduct._id, {
          set: updateFields,
        })
        .commit();
    }

    return json({
      success: true,
      message: 'Product tags processed successfully',
      productMapRef,
      colorVariantRef,
    });
  } catch (error) {
    console.error('Error processing Shopify webhook:', error);
    return json({error: 'Internal server error'}, {status: 500});
  }
}

export async function loader({request}: LoaderFunctionArgs) {
  return json({message: 'Shopify webhook endpoint'});
}
