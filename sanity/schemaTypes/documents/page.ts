import {DocumentIcon} from '@sanity/icons'
import {defineField, defineArrayMember, defineType} from 'sanity'

import {validateSlug} from '../../utils/validateSlug'
import { GROUPS } from '../../constants'

export const pageType = defineType({
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
      description: 'Page title that appears in the browser tab and search results',
      validation: (Rule) => [
        Rule.required().error('Page title is required'),
        Rule.max(60).warning('Consider keeping titles under 60 characters for SEO'),
      ],
    }),
    defineField({
      name: 'slug',
      group: 'editorial',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL-friendly version of the title (auto-generated from title)',
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
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'colorTheme'}})],
      description: 'Color theme for this page',
      group: 'theme',
      validation: (Rule) => Rule.max(1).warning('Only one color theme can be selected'),
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
        defineArrayMember({ type: 'customTable' }),
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
