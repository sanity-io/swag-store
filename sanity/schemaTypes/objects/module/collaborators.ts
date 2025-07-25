import {defineField, defineType} from 'sanity'

export const collaboratorsType = defineType({
  name: 'collaborators',
  title: 'Collaborators',
  type: 'object',
  fields: [
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Collaborators',
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
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'array',
              of: [{type: 'block'}],
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Optional link for the collaborator',
            }),
          ],
          preview: {
            select: {
              title: 'name',
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
        title: subtitle || 'Collaborators',
      }
    },
  },
})
