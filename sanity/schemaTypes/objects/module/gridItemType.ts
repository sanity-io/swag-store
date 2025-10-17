import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'

import blocksToText from '../../../utils/blocksToText'

export const gridItemType = defineType({
  name: 'gridItem',
  title: 'Grid Item',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      description: 'Image for this grid item with hotspot support',
      validation: (Rule) => Rule.required().error('Image is required for grid items'),
    }),
    defineField({
      name: 'body',
      type: 'portableTextSimple',
      description: 'Text content for this grid item',
      validation: (Rule) => Rule.required().error('Content is required for grid items'),
    }),
    defineField({
      name: 'colorTheme',
      type: 'array',
      of: [{type: 'reference', to: {type: 'colorTheme'}}],
      description: 'Color theme for this grid item',
      validation: (Rule) => Rule.max(1).warning('Only one color theme can be selected'),
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'object',
      fields: [
        defineField({
          name: 'showCta',
          title: 'CTA Status',
          type: 'string',
          options: {
            list: [
              {title: 'Show CTA', value: 'show'},
              {title: 'Hide CTA', value: 'hide'},
            ],
            layout: 'radio',
          },
          initialValue: 'hide',
          description: 'Enable to show a call-to-action button',
        }),
        defineField({
          name: 'text',
          title: 'Text',
          type: 'string',
          hidden: ({parent}) => parent?.showCta !== 'show',
          validation: (Rule) => Rule.custom((value, context) => {
            const {parent} = context as any;
            if (parent?.showCta === 'show' && !value) {
              return 'CTA text is required when CTA is enabled';
            }
            return true;
          }),
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'url',
          hidden: ({parent}) => parent?.showCta !== 'show',
          validation: (Rule) => Rule.custom((value, context) => {
            const {parent} = context as any;
            if (parent?.showCta === 'show' && !value) {
              return 'CTA URL is required when CTA is enabled';
            }
            return true;
          }),
        }),
        defineField({
          name: 'color',
          title: 'Color',
          type: 'string',
          hidden: ({parent}) => parent?.showCta !== 'show',
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
