import {DocumentIcon} from '@sanity/icons'
import {defineField, defineArrayMember} from 'sanity'

import {validateSlug} from '../../utils/validateSlug'
import { GROUPS } from '../../constants'

export const pageType = defineField({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'title',
      group: 'editorial',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      group: 'editorial',
      type: 'slug',
      options: {source: 'title'},
      validation: validateSlug,
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      readOnly: true,
      group: 'editorial',
    }),
    defineField({
      name: 'colorTheme',
      type: 'reference',
      to: [{type: 'colorTheme'}],
      group: 'theme',
    }),
    defineField({
      name: 'hero',
      type: 'hero',
      hidden: ({document}) => !document?.showHero,
      group: 'editorial',
    }),

    defineField({
      name: 'modules',
      type: 'array',
      of: [
        defineArrayMember({ type: 'informationHero' }),
        defineArrayMember({ type: 'logoGrid' }),
        defineArrayMember({ type: 'techInformation' }),
        defineArrayMember({ type: 'collaborators' }),
        defineArrayMember({ type: 'faqs' }),
        defineArrayMember({ type: 'careers' }),
      ],
      group: 'editorial',
    }),

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    })
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
