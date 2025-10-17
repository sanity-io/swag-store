import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'

export const logoGridType = defineType({
  name: 'logoGrid',
  title: 'Logo Grid',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Section title for the logo grid',
      validation: (Rule) => [
        Rule.max(100).warning('Consider keeping titles under 100 characters'),
      ],
    }),
    defineField({
      name: 'items',
      title: 'Logo Items',
      type: 'array',
      description: 'Collection of logos to display in the grid',
      validation: (Rule) => [
        Rule.min(1).error('At least one logo item is required'),
        Rule.max(20).warning('Consider limiting to 20 logos for better performance'),
      ],
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Logo Image', 
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: (Rule) => [
                Rule.required().error('Logo image is required'),
              ],
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Alternative text for screen readers',
                  validation: (Rule) => [
                    Rule.required().error('Alt text is required for accessibility'),
                    Rule.max(125).warning('Keep alt text under 125 characters'),
                  ],
                }),
              ],
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Name or title of the logo',
              validation: (Rule) => [
                Rule.max(50).warning('Consider keeping titles under 50 characters'),
              ],
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Link for the logo (optional)',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Logo Grid',
      }
    },
  },
})
