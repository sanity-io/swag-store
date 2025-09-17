import {defineField} from 'sanity'

export const specialGridItemType = defineField({
  name: 'specialGridItem',
  title: 'Special Grid Item',
  type: 'object',
  fields: [
    defineField({
        name: 'colorTheme',
        type: 'reference',
        to: [{type: 'colorTheme'}],
      }),
    defineField({
      name: 'trigger',
      title: 'Trigger',
      type: 'string',
      options: {
        list: [
          {title: 'Random', value: 'random'},
          {title: 'Comments', value: 'comments'},
          {title: 'Clear the Cart', value: 'clearCart'},
          {title: 'Checkout', value: 'checkout'},
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'color',
          title: 'Color',
          type: 'string',
          options: {
            list: [
              {title: 'Orange', value: 'orange'},
              {title: 'Black', value: 'black'},
              {title: 'White', value: 'white'},
              {title: 'Green', value: 'green'},
            ],
            layout: 'dropdown',
          },
          initialValue: 'orange',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      trigger: 'trigger',
      ctaText: 'cta.text',
      background: 'background',
    },
    prepare({trigger, ctaText, background}) {
      return {
        title: ctaText || 'Special Grid Item',
        subtitle: `Trigger: ${trigger} | Background: ${background}`,
      }
    },
  },
})
