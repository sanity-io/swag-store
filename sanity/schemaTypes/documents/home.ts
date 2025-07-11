import {DocumentIcon} from '@sanity/icons'
import {defineField, defineArrayMember} from 'sanity'

import { GROUPS } from '../../constants'

export const homeType = defineField({
  name: 'home',
  title: 'Home',
  type: 'document',
  icon: DocumentIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'title',
      title: 'CMS Title',
      description: 'Only used internally, helps reference specific homepages/campaigns',
      group: 'editorial',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'colorTheme',
      type: 'reference',
      to: [{type: 'colorTheme'}],
      group: 'theme',
    }),
    defineField({
        name: 'modules',
        type: 'array',
        of: [
          defineArrayMember({ type: 'accordion' }),
          defineArrayMember({ type: 'callout' }),
          defineArrayMember({ type: 'grid' }),
          defineArrayMember({ type: 'images' }),
          defineArrayMember({ type: 'imageWithProductHotspots', title: 'Image with Hotspots' }),
          defineArrayMember({ type: 'instagram' }),
          defineArrayMember({ type: 'products' }),
        ],
        group: 'editorial',
      }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      seoImage: 'seo.image',
      title: 'title',
    },
    prepare({seoImage, title}) {
      return {
        media: seoImage ?? DocumentIcon,
        title,
      }
    },
  },
})
