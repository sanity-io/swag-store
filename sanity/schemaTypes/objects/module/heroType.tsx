import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'

export const heroType = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'text',
      rows: 3,
      description: 'Main headline for the hero section',
      validation: (Rule) => [
        Rule.required().error('Hero title is required'),
        Rule.max(200).warning('Consider shortening the title for better readability'),
      ],
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      description: 'Supporting text that appears below the title',
      validation: (Rule) => [
        Rule.max(500).warning('Consider shortening the description for better readability'),
      ],
    }),
    defineField({
      name: 'link',
      type: 'array',
      of: [{type: 'linkInternal'}, {type: 'linkExternal'}],
      description: 'Call-to-action links (maximum 1)',
      validation: (Rule) => Rule.max(1),
    }),
    defineField({
      name: 'content',
      type: 'array',
      description: 'Visual content for the hero section (maximum 1)',
      validation: (Rule) => Rule.max(1),
      of: [
        defineArrayMember({
          name: 'productWithVariant',
          type: 'productWithVariant',
        }),
        defineArrayMember({
          name: 'imageWithProductHotspots',
          type: 'imageWithProductHotspots',
        }),
      ],
    }),
  ],
})
