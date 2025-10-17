import {defineField, defineType} from 'sanity'
import {WaitlistItemDisplay} from '../../components/inputs/WaitlistItemDisplay'

export const customerType = defineType({
  name: 'customer',
  title: 'Customer',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'acceptsMarketing',
      title: 'Marketing Preference',
      type: 'string',
      options: {
        list: [
          {title: 'Accepts Marketing', value: 'accepted'},
          {title: 'No Marketing', value: 'declined'},
        ],
        layout: 'radio',
      },
      initialValue: 'declined',
      description: 'Whether the customer has opted in to receive marketing emails',
    }),
    defineField({
      name: 'backInStock',
      title: 'Back in Stock Notifications',
      type: 'array',
      components: {
        input: WaitlistItemDisplay,
      },
      of: [
        {
          type: 'object',
          name: 'waitlistItem',
          title: 'Waitlist Item',
          fields: [
            {
              name: 'productVariant',
              title: 'Product Variant',
              type: 'array',
              of: [{type: 'reference', to: {type: 'productVariant'}}],
              validation: (Rule) => [
                Rule.required().error('Product variant is required'),
                Rule.max(1).warning('Only one product variant can be selected'),
              ],
            },
            {
              name: 'dateAdded',
              title: 'Date Added',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              variantTitle: 'productVariant.store.title',
              productId: 'productVariant.store.productId',
              dateAdded: 'dateAdded',
            },
            prepare(selection) {
              const {variantTitle, productId, dateAdded} = selection
              return {
                title: variantTitle || 'Product Variant',
                subtitle: `${productId ? `Product ID: ${productId}` : ''} • ${dateAdded ? new Date(dateAdded).toLocaleDateString() : 'No date'}`,
              }
            },
          },
        },
      ],
      description: 'Products the customer wants to be notified about when back in stock',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'acceptsMarketing',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {
        title: title,
        subtitle: subtitle ? 'Accepts Marketing' : 'No Marketing',
      }
    },
  },
})
