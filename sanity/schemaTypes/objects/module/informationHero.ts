import {defineField, defineType} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons'

export const informationHeroType = defineType({
  name: 'informationHero',
  title: 'Information Hero',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Small text that appears above the main header',
      validation: (Rule) => [
        Rule.max(100).warning('Consider keeping subtitles under 100 characters'),
      ],
    }),
    defineField({
      name: 'header',
      title: 'Header',
      type: 'string',
      description: 'Main headline for the information hero section',
      validation: (Rule) => [
        Rule.required().error('Header is required'),
        Rule.max(200).warning('Consider keeping headers under 200 characters for readability'),
      ],
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Rich text content for the information hero section',
      validation: (Rule) => [
        Rule.required().error('Content is required'),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'header',
      subtitle: 'subtitle',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Information Hero',
        subtitle: subtitle,
      }
    },
  },
})
