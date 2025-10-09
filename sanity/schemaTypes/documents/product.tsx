import {TagIcon} from '@sanity/icons'
import pluralize from 'pluralize-esm'
import ProductHiddenInput from '../../components/inputs/ProductHidden'
import ShopifyDocumentStatus from '../../components/media/ShopifyDocumentStatus'
import {defineField, defineType} from 'sanity'
import {getPriceRange} from '../../utils/getPriceRange'
import {GROUPS} from '../../constants'
import {ProductSalesCountInput} from '../../components/attribution/ProductSalesCount'

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
      name: 'productMeta',
      title: 'Product Meta',
      type: 'reference',
      to: [{type: 'productMeta'}],
      group: 'editorial',
      hidden: (v) => {
        return v.value !== undefined
      },
    }),
    defineField({
      name: 'productValue',
      title: 'Product Value',
      type: 'number',
      components: {
        input: ProductSalesCountInput,
      },
      group: 'editorial',
      readOnly: true,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'string',
      group: 'editorial',
    }),
    defineField({
      name: 'backInStock',
      title: 'Back in Stock (enables the back in stock form)',
      description: 'If enabled, the back in stock form will be displayed on the product page',
      type: 'boolean',
      group: 'editorial',
      initialValue: false,
    }),
    defineField({
      name: 'colorTheme',
      type: 'reference',
      to: [{type: 'colorTheme'}],
      group: 'testing',
    }),
    defineField({
      name: 'colorVariant',
      type: 'reference',
      to: [{type: 'colorVariant'}],
      group: 'testing',
    }),
    defineField({
      name: 'productMap',
      title: 'Product Map',
      type: 'reference',
      to: [{type: 'productMap'}],
      group: 'testing',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{type: 'image', fields: [{name: 'alt', type: 'string', title: 'Alt text'}]}],
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
      title: 'Hide from Search',
      type: 'boolean',
      group: 'editorial',
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
