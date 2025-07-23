import {defineField, defineType} from 'sanity'

export const techInformationType = defineType({
  name: 'techInformation',
  title: 'Tech Information',
  type: 'object',
  fields: [
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'infoBlocks',
      title: 'Information Blocks',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Alternative text for screen readers',
                }),
              ],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              of: [{type: 'block'}],
            }),
          ],
          preview: {
            select: {
              media: 'image',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      subtitle: 'subtitle',
    },
    prepare({subtitle}) {
      return {
        title: subtitle || 'Tech Information',
      }
    },
  },
})
