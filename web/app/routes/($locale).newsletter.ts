import {ActionFunctionArgs} from 'react-router';
import {createClient} from '@sanity/client';

export type NewsletterActionState = {
  id?: number;
  payload?: Record<string, string>;
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
  alreadySubscribed?: boolean;
};

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const acceptsMarketing = formData.get('acceptsMarketing')?.toString() || 'declined';
  const productId = formData.get('productId')?.toString();

  let message: string | undefined;

  if (!email) {
    message = 'Email is required';
  } else if (!email.includes('@')) {
    message = 'Please enter a valid email address';
  }

  if (message) {
    return {
      id: Date.now(),
      errors: {email: message},
      payload: {email: email || ''},
      success: false,
    };
  }

  try {
    // Create Sanity client
    const client = createClient({
      projectId: context.env.SANITY_PROJECT_ID,
      dataset: context.env.SANITY_DATASET,
      apiVersion: context.env.SANITY_API_VERSION || '2025-08-27',
      token: context.env.SANITY_API_TOKEN,
      useCdn: false,
    });

    // Check if customer already exists
    const existingCustomer = await client.fetch(
      `*[_type == "customer" && email == $email][0]`,
      {email}
    );

    if (existingCustomer) {
      // Check if this is a general newsletter signup (no productId)
      if (!productId) {
        // For general newsletter, check if they already accept marketing
        if (existingCustomer.acceptsMarketing === 'accepted') {
          return {
            id: Date.now(),
            payload: {email},
            success: false,
            message: 'You are already subscribed to our newsletter!',
            alreadySubscribed: true,
          };
        }
      }

      // Update existing customer
      const updateData: any = {
        acceptsMarketing,
      };

      // If productId is provided, add it to backInStock array
      if (productId) {
        // Look up the Sanity productVariant by store.gid
        const sanityProductVariant = await client.fetch(
          `*[_type == "productVariant" && store.gid == $productId][0]`,
          {productId}
        );

        if (!sanityProductVariant) {
          return {
            id: Date.now(),
            payload: {email},
            success: false,
            message: 'Product not found. Please try again.',
          };
        }

        const currentBackInStock = existingCustomer.backInStock || [];
        const waitlistItem = {
          _key: `waitlist-${sanityProductVariant._id}-${Date.now()}`,
          _type: 'waitlistItem',
          productVariant: {
            _type: 'reference',
            _ref: sanityProductVariant._id,
          },
          dateAdded: new Date().toISOString(),
        };
        
        // Check if product is already in waitlist
        if (currentBackInStock.some((item: any) => item.productVariant?._ref === sanityProductVariant._id)) {
          return {
            id: Date.now(),
            payload: {email},
            success: false,
            message: 'You are already on the waitlist for this product!',
            alreadySubscribed: true,
          };
        }
        
        updateData.backInStock = [...currentBackInStock, waitlistItem];
      }

      await client
        .patch(existingCustomer._id)
        .set(updateData)
        .commit();
    } else {
      // Create new customer
      const customerData: any = {
        _type: 'customer',
        email,
        acceptsMarketing,
        backInStock: [],
        createdAt: new Date().toISOString(),
      };

      // If productId is provided, add it to backInStock array
      if (productId) {
        // Look up the Sanity productVariant by store.gid
        const sanityProductVariant = await client.fetch(
          `*[_type == "productVariant" && store.gid == $productId][0]`,
          {productId}
        );

        if (!sanityProductVariant) {
          return {
            id: Date.now(),
            payload: {email},
            success: false,
            message: 'Product not found. Please try again.',
          };
        }

        customerData.backInStock = [
          {
            _key: `waitlist-${sanityProductVariant._id}-${Date.now()}`,
            _type: 'waitlistItem',
            productVariant: {
              _type: 'reference',
              _ref: sanityProductVariant._id,
            },
            dateAdded: new Date().toISOString(),
          },
        ];
      }

      await client.create(customerData);
    }

    return {
      id: Date.now(),
      payload: {email},
      success: true,
      message: productId 
        ? 'You\'ve been added to the waitlist for this product!' 
        : 'Successfully subscribed to our newsletter!',
    };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return {
      id: Date.now(),
      payload: {email: email || ''},
      success: false,
      message: 'There was an error processing your subscription. Please try again.',
    };
  }
}
