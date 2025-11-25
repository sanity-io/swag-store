import {TagIcon} from '@sanity/icons'
import pluralize from 'pluralize-esm'
import ProductHiddenInput from '../../components/inputs/ProductHidden'
import ShopifyDocumentStatus from '../../components/media/ShopifyDocumentStatus'
import {defineField, defineType, defineArrayMember} from 'sanity'
import {getPriceRange} from '../../utils/getPriceRange'
import {GROUPS} from '../../constants'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: TagIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'hidden',
      type: 'string',
      components: {
        field: ProductHiddenInput,
      },
      group: GROUPS.map((group) => group.name),
      hidden: ({parent}) => {
        const isActive = parent?.store?.status === 'active'
        const isDeleted = parent?.store?.isDeleted
        return !parent?.store || (isActive && !isDeleted)
      },
    }),
    defineField({
      name: 'titleProxy',
      title: 'Title',
      type: 'proxyString',
      options: {field: 'store.title'},
    }),
    defineField({
      name: 'slugProxy',
      title: 'Slug',
      type: 'proxyString',
      options: {field: 'store.slug.current'},
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'string',
      group: 'editorial',
    }),
    defineField({
      name: 'backInStock',
      title: 'Back in Stock Form',
      description: 'Enable the back in stock form on the product page',
      type: 'string',
      options: {
        list: [
          {title: 'Enabled', value: 'enabled'},
          {title: 'Disabled', value: 'disabled'},
        ],
        layout: 'radio',
      },
      group: 'editorial',
      initialValue: 'disabled',
    }),
    defineField({
      name: 'colorTheme',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'colorTheme'}})],
      description: 'Color theme for this product',
      group: 'testing',
      validation: (Rule) => Rule.max(1).warning('Only one color theme can be selected'),
    }),
    defineField({
      name: 'colorVariant',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'colorVariant'}})],
      description: 'Color variant for this product',
      group: 'testing',
      validation: (Rule) => Rule.max(1).warning('Only one color variant can be selected'),
    }),
    defineField({
      name: 'productMap',
      title: 'Product Map',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'productMap'}})],
      description: 'Product mapping configuration',
      group: 'testing',
      validation: (Rule) => Rule.max(1).warning('Only one product map can be selected'),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description: 'Alternative text for screen readers',
              validation: (Rule) => [
                Rule.required().error('Alt text is required for accessibility'),
                Rule.max(125).warning('Keep alt text under 125 characters'),
              ],
            },
          ],
        },
      ],
      description: 'Product images with hotspot support',
      group: 'editorial',
    }),
    defineField({
      name: 'body',
      type: 'portableText',
      group: 'editorial',
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required().error('Category is required'),
      group: 'editorial',
    }),
    defineField({
      name: 'store',
      type: 'shopifyProduct',
      description: 'Product data from Shopify (read-only)',
      group: 'shopifySync',
    }),
    defineField({
      name: 'hideFromSearch',
      title: 'Search Visibility',
      description: 'Control whether this product appears in search results',
      type: 'string',
      options: {
        list: [
          {title: 'Visible in Search', value: 'visible'},
          {title: 'Hidden from Search', value: 'hidden'},
        ],
        layout: 'radio',
      },
      group: 'editorial',
      initialValue: 'visible',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      name: 'titleAsc',
      title: 'Title (A-Z)',
      by: [{field: 'store.title', direction: 'asc'}],
    },
    {
      name: 'titleDesc',
      title: 'Title (Z-A)',
      by: [{field: 'store.title', direction: 'desc'}],
    },
    {
      name: 'priceDesc',
      title: 'Price (Highest first)',
      by: [{field: 'store.priceRange.minVariantPrice', direction: 'desc'}],
    },
    {
      name: 'priceAsc',
      title: 'Price (Lowest first)',
      by: [{field: 'store.priceRange.minVariantPrice', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      isDeleted: 'store.isDeleted',
      options: 'store.options',
      previewImageUrl: 'store.previewImageUrl',
      priceRange: 'store.priceRange',
      status: 'store.status',
      title: 'store.title',
      variants: 'store.variants',
    },
    prepare(selection) {
      const {isDeleted, options, previewImageUrl, priceRange, status, title, variants} = selection

      const optionCount = options?.length
      const variantCount = variants?.length

      let description = [
        variantCount ? pluralize('variant', variantCount, true) : 'No variants',
        optionCount ? pluralize('option', optionCount, true) : 'No options',
      ]

      let subtitle = getPriceRange(priceRange)
      if (status !== 'active') {
        subtitle = '(Unavailable in Shopify)'
      }
      if (isDeleted) {
        subtitle = '(Deleted from Shopify)'
      }

      return {
        description: description.join(' / '),
        subtitle,
        title,
        media: (
          <ShopifyDocumentStatus
            isActive={status === 'active'}
            isDeleted={isDeleted}
            type="product"
            url={previewImageUrl}
            title={title}
          />
        ),
      }
    },
  },
})
