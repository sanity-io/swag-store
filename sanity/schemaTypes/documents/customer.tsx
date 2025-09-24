import {defineField, defineType} from 'sanity'

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
      title: 'Accepts Marketing',
      type: 'boolean',
      initialValue: false,
      description: 'Whether the customer has opted in to receive marketing emails',
    }),
    defineField({
      name: 'backInStock',
      title: 'Back in Stock Notifications',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'waitlistItem',
          title: 'Waitlist Item',
          fields: [
            {
              name: 'productVariant',
              title: 'Product Variant',
              type: 'reference',
              to: [{type: 'productVariant'}],
              validation: (Rule) => Rule.required(),
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
              title: 'productVariant.store.title',
              subtitle: 'dateAdded',
            },
            prepare(selection) {
              const {title, subtitle} = selection
              return {
                title: title || 'Product Variant',
                subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : 'No date',
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
