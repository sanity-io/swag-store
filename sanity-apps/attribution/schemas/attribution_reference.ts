export const attribution_reference = {
  name: 'attribution_reference',
  title: 'Attribution Reference',
  type: 'document',
  fields: [
    {
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
      options: {
        list: [
          { title: 'Page', value: 'page' },
          { title: 'Product', value: 'product' },
          { title: 'Collection', value: 'collection' }
        ],
        layout: 'radio'
      },
      validation: (rule: any) => rule.required(),
      description: 'Type of content this attribution is associated with'
    },
    {
      name: 'contentReference',
      title: 'Content Reference',
      type: 'reference',
      to: [
        { type: 'page' },
        { type: 'product' },
        { type: 'collection' }
      ],
      validation: (rule: any) => rule.required(),
      description: 'Reference to the specific page, product, or collection'
    },
    {
      name: 'contentTitle',
      title: 'Content Title',
      type: 'string',
      validation: (rule: any) => rule.required(),
      description: 'Title of the referenced content for easy identification'
    },
    {
      name: 'contentSlug',
      title: 'Content Slug',
      type: 'string',
      description: 'URL slug of the referenced content'
    },
    {
      name: 'attributeKey',
      title: 'Attribute Key',
      type: 'string',
      validation: (rule: any) => rule.required(),
      description: 'The attribute key from the webhook that identifies this content'
    },
    {
      name: 'attributeValue',
      title: 'Attribute Value',
      type: 'string',
      validation: (rule: any) => rule.required(),
      description: 'The attribute value from the webhook that matches this content'
    },
    {
      name: 'currentSalesValue',
      title: 'Current Sales Value',
      type: 'number',
      initialValue: 0,
      description: 'Current total sales value attributed to this content'
    },
    {
      name: 'addToCartCount',
      title: 'Add to Cart Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of add to cart events on this content'
    },
    {
      name: 'conversionRate',
      title: 'Conversion Rate',
      type: 'number',
      initialValue: 0,
      description: 'Conversion rate (orders / add to cart events)',
      validation: (rule: any) => rule.min(0).max(1)
    },
    {
      name: 'lastAttributionUpdate',
      title: 'Last Attribution Update',
      type: 'datetime',
      description: 'When this attribution was last updated from webhook data'
    },
    {
      name: 'attributionHistory',
      title: 'Attribution History',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'date',
              title: 'Date',
              type: 'datetime',
              validation: (rule: any) => rule.required()
            },
            {
              name: 'salesValue',
              title: 'Sales Value',
              type: 'number',
              validation: (rule: any) => rule.required().min(0)
            },
            {
              name: 'addToCartCount',
              title: 'Add to Cart Count',
              type: 'number',
              validation: (rule: any) => rule.required().min(0)
            },
            {
              name: 'ordersCount',
              title: 'Orders Count',
              type: 'number',
              validation: (rule: any) => rule.required().min(0)
            },
            {
              name: 'source',
              title: 'Source',
              type: 'string',
              description: 'Source of the attribution update (webhook, manual, etc.)'
            }
          ]
        }
      ],
      description: 'Historical tracking of attribution metrics'
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this attribution reference is currently active'
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Additional notes about this attribution reference'
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date()
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date()
    }
  ],
  preview: {
    select: {
      title: 'contentTitle',
      subtitle: 'contentType',
      salesValue: 'currentSalesValue',
      addToCartCount: 'addToCartCount',
      isActive: 'isActive'
    },
    prepare({ title, subtitle, salesValue, addToCartCount, isActive }: any) {
      const statusIcon = isActive ? '📊' : '⏸️'
      const typeIcon: Record<string, string> = {
        page: '📄',
        product: '🛍️',
        collection: '📦'
      }
      
      return {
        title: `${statusIcon} ${title}`,
        subtitle: `${typeIcon[subtitle] || '📄'} ${subtitle} • $${salesValue?.toFixed(2) || '0.00'} • ${addToCartCount || 0} carts`,
        media: typeIcon[subtitle] || '📄'
      }
    }
  }
}
