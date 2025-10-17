import {defineField, defineType} from 'sanity'
import {SearchIcon} from '@sanity/icons'

export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'SEO title for search engines (max 50 characters)',
      validation: (Rule) => [
        Rule.max(50).warning('Longer titles may be truncated by search engines'),
        Rule.required().error('SEO title is required for search optimization'),
      ],
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
      description: 'SEO description for search engines (max 150 characters)',
      validation: (Rule) => [
        Rule.max(150).warning('Longer descriptions may be truncated by search engines'),
        Rule.required().error('SEO description is required for search optimization'),
      ],
    }),
    defineField({
      name: 'image',
      type: 'image',
      description: 'SEO image for social media sharing',
      options: {
        hotspot: true,
      },
    }),
  ],
})
