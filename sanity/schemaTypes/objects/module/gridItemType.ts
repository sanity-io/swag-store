import {defineField} from 'sanity'

import blocksToText from '../../../utils/blocksToText'

export const gridItemType = defineField({
  name: 'gridItem',
  title: 'Grid Item',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      // validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'colorTheme',
      type: 'reference',
      to: [{type: 'colorTheme'}],
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'object',
      fields: [
        defineField({
          name: 'showCta',
          title: 'Show CTA',
          type: 'boolean',
          initialValue: false,
          description: 'Enable to show a call-to-action button',
        }),
        defineField({
          name: 'text',
          title: 'Text',
          type: 'string',
          hidden: ({parent}) => !parent?.showCta,
          validation: (Rule) => Rule.custom((value, context) => {
            const {parent} = context as any;
            if (parent?.showCta && !value) {
              return 'CTA text is required when CTA is enabled';
            }
            return true;
          }),
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'url',
          hidden: ({parent}) => !parent?.showCta,
          validation: (Rule) => Rule.custom((value, context) => {
            const {parent} = context as any;
            if (parent?.showCta && !value) {
              return 'CTA URL is required when CTA is enabled';
            }
            return true;
          }),
        }),
        defineField({
          name: 'color',
          title: 'Color',
          type: 'string',
          hidden: ({parent}) => !parent?.showCta,
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
      body: 'body',
      image: 'image',
      title: 'title',
    },
    prepare({body, image, title}) {
      return {
        media: image,
        subtitle: body && blocksToText(body),
        title,
      }
    },
  },
})
