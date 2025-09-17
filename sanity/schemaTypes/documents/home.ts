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
      name: 'productAgeAnalysis',
      title: 'Product Age Analysis',
      type: 'array',
      description: 'Automatically generated analysis of product ages from modules',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{type: 'product'}],
            }),
            defineField({
              name: 'lastUpdated',
              title: 'Last Updated',
              type: 'datetime',
            }),
            defineField({
              name: 'createdAt',
              title: 'Created At',
              type: 'datetime',
            }),
            defineField({
              name: 'ageInDays',
              title: 'Age in Days (Since Created)',
              type: 'number',
              description: 'Days since the product was created',
            }),
            defineField({
              name: 'updatedAgeInDays',
              title: 'Days Since Last Update',
              type: 'number',
              description: 'Days since the product was last updated',
            }),
            defineField({
              name: 'isOld',
              title: 'Considered Old',
              type: 'boolean',
              description: 'Products older than 30 days',
            }),
          ],
          preview: {
            select: {
              title: 'product.title',
              productTitle: 'product.store.title',
              ageInDays: 'ageInDays',
              updatedAgeInDays: 'updatedAgeInDays',
              isOld: 'isOld',
              createdAt: 'createdAt',
              lastUpdated: 'lastUpdated',
            },
            prepare({title, productTitle, ageInDays, updatedAgeInDays, isOld, createdAt, lastUpdated}) {
              const displayTitle = productTitle || title || 'Untitled Product';
              const createdAgeText = ageInDays ? `${ageInDays}d old` : 'Unknown age';
              const updatedAgeText = updatedAgeInDays ? `${updatedAgeInDays}d since update` : 'Unknown';
              const status = isOld ? '🔴 OLD' : '🟢 FRESH';
              const createdText = createdAt ? 
                new Date(createdAt).toLocaleDateString() : 'Unknown';
              
              return {
                title: displayTitle,
                subtitle: `${status} - Created: ${createdAgeText} | Updated: ${updatedAgeText}`,
              };
            },
          },
        },
      ],
      readOnly: true,
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
