import {DocumentIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const attributionEventType = defineType({
  name: 'attributionEvent',
  title: 'Attribution Event',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{type: 'page'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'pageSlug',
      title: 'Page Slug',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'landingTimestamp',
      title: 'Landing Timestamp',
      type: 'datetime',
    }),
    defineField({
      name: 'landingUrl',
      title: 'Landing URL',
      type: 'url',
    }),
    defineField({
      name: 'referrer',
      title: 'Referrer',
      type: 'url',
    }),
    defineField({
      name: 'utm',
      title: 'UTM Parameters',
      type: 'array',
      of: [{type: 'attributionUtmParam'}],
    }),
    defineField({
      name: 'cartId',
      title: 'Cart ID',
      type: 'string',
    }),
    defineField({
      name: 'checkoutUrl',
      title: 'Checkout URL',
      type: 'url',
    }),
    defineField({
      name: 'totalQuantity',
      title: 'Total Quantity',
      type: 'number',
    }),
    defineField({
      name: 'value',
      title: 'Order Value',
      type: 'number',
    }),
    defineField({
      name: 'currencyCode',
      title: 'Currency',
      type: 'string',
    }),
    defineField({
      name: 'totals',
      title: 'Totals',
      type: 'object',
      fields: [
        defineField({
          name: 'totalAmount',
          title: 'Total Amount',
          type: 'attributionMoney',
        }),
        defineField({
          name: 'subtotalAmount',
          title: 'Subtotal Amount',
          type: 'attributionMoney',
        }),
        defineField({
          name: 'totalTaxAmount',
          title: 'Tax Amount',
          type: 'attributionMoney',
        }),
        defineField({
          name: 'totalDutyAmount',
          title: 'Duty Amount',
          type: 'attributionMoney',
        }),
      ],
    }),
    defineField({
      name: 'lineItems',
      title: 'Line Items',
      type: 'array',
      of: [{type: 'attributionLineItem'}],
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'pageTitle',
      fallbackTitle: 'page.title',
      landingTimestamp: 'landingTimestamp',
      value: 'value',
      currency: 'currencyCode',
    },
    prepare({title, fallbackTitle, landingTimestamp, value, currency}) {
      const displayTitle = title || fallbackTitle || 'Attribution Event'
      const amount =
        typeof value === 'number'
          ? currency
            ? `${currency} ${value.toFixed(2)}`
            : value.toFixed(2)
          : 'No value'
      const dateLabel = landingTimestamp
        ? new Date(landingTimestamp).toLocaleString()
        : 'No timestamp'

      return {
        title: displayTitle,
        subtitle: `${amount} • ${dateLabel}`,
        media: DocumentIcon,
      }
    },
  },
})
