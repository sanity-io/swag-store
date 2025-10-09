export const order = {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    {
      name: 'shopifyOrderId',
      title: 'Shopify Order ID',
      type: 'string',
      validation: (rule: any) => rule.required(),
      description: 'Unique identifier from Shopify'
    },
    {
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      validation: (rule: any) => rule.required(),
      description: 'Human-readable order number'
    },
    {
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string',
      validation: (rule: any) => rule.required().email(),
      description: 'Email address of the customer who placed the order'
    },
    {
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      description: 'Full name of the customer'
    },
    {
      name: 'attributions',
      title: 'Attributions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'source',
              title: 'Source',
              type: 'string',
              options: {
                list: [
                  { title: 'Email Campaign', value: 'email' },
                  { title: 'Social Media', value: 'social' },
                  { title: 'Search Engine', value: 'search' },
                  { title: 'Direct', value: 'direct' },
                  { title: 'Referral', value: 'referral' },
                  { title: 'Paid Advertising', value: 'paid' },
                  { title: 'Other', value: 'other' }
                ]
              }
            },
            {
              name: 'medium',
              title: 'Medium',
              type: 'string',
              description: 'e.g., cpc, email, social, organic'
            },
            {
              name: 'campaign',
              title: 'Campaign',
              type: 'string',
              description: 'Campaign name or identifier'
            },
            {
              name: 'content',
              title: 'Content',
              type: 'string',
              description: 'Content identifier or ad variation'
            },
            {
              name: 'term',
              title: 'Term',
              type: 'string',
              description: 'Search term or keyword'
            },
            {
              name: 'utmSource',
              title: 'UTM Source',
              type: 'string'
            },
            {
              name: 'utmMedium',
              title: 'UTM Medium',
              type: 'string'
            },
            {
              name: 'utmCampaign',
              title: 'UTM Campaign',
              type: 'string'
            },
            {
              name: 'utmContent',
              title: 'UTM Content',
              type: 'string'
            },
            {
              name: 'utmTerm',
              title: 'UTM Term',
              type: 'string'
            }
          ]
        }
      ],
      description: 'Attribution data for this order'
    },
    {
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'productReference',
              title: 'Product Reference',
              type: 'reference',
              to: [{ type: 'product' }],
              description: 'Reference to the product in the main schema'
            },
            {
              name: 'variantId',
              title: 'Variant ID',
              type: 'string',
              description: 'Shopify variant ID'
            },
            {
              name: 'title',
              title: 'Product Title',
              type: 'string',
              validation: (rule: any) => rule.required()
            },
            {
              name: 'variantTitle',
              title: 'Variant Title',
              type: 'string'
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (rule: any) => rule.required().min(1)
            },
            {
              name: 'price',
              title: 'Price',
              type: 'number',
              validation: (rule: any) => rule.required().min(0)
            },
            {
              name: 'totalPrice',
              title: 'Total Price',
              type: 'number',
              validation: (rule: any) => rule.required().min(0)
            }
          ]
        }
      ],
      validation: (rule: any) => rule.required().min(1),
      description: 'Products included in this order'
    },
    {
      name: 'totalCost',
      title: 'Total Cost',
      type: 'number',
      validation: (rule: any) => rule.required().min(0),
      description: 'Total order amount before taxes and shipping'
    },
    {
      name: 'subtotal',
      title: 'Subtotal',
      type: 'number',
      validation: (rule: any) => rule.required().min(0)
    },
    {
      name: 'taxes',
      title: 'Taxes',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'shipping',
      title: 'Shipping Cost',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
      validation: (rule: any) => rule.required().min(0),
      description: 'Final amount including taxes and shipping'
    },
    {
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'USD',
      validation: (rule: any) => rule.required()
    },
    {
      name: 'orderDate',
      title: 'Order Date',
      type: 'datetime',
      validation: (rule: any) => rule.required(),
      initialValue: () => new Date()
    },
    {
      name: 'fulfillmentStatus',
      title: 'Fulfillment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Unfulfilled', value: 'unfulfilled' },
          { title: 'Partially Fulfilled', value: 'partially_fulfilled' },
          { title: 'Fulfilled', value: 'fulfilled' },
          { title: 'Cancelled', value: 'cancelled' }
        ]
      },
      initialValue: 'unfulfilled'
    },
    {
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Paid', value: 'paid' },
          { title: 'Partially Paid', value: 'partially_paid' },
          { title: 'Refunded', value: 'refunded' },
          { title: 'Partially Refunded', value: 'partially_refunded' }
        ]
      },
      initialValue: 'pending'
    },
    {
      name: 'webhookData',
      title: 'Webhook Data',
      type: 'object',
      fields: [
        {
          name: 'rawData',
          title: 'Raw Webhook Data',
          type: 'text',
          description: 'Complete webhook payload for debugging'
        },
        {
          name: 'processedAt',
          title: 'Processed At',
          type: 'datetime',
          initialValue: () => new Date()
        },
        {
          name: 'webhookId',
          title: 'Webhook ID',
          type: 'string'
        }
      ],
      description: 'Raw webhook data and processing metadata'
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
      title: 'orderNumber',
      subtitle: 'customerEmail',
      total: 'totalAmount',
      currency: 'currency',
      orderDate: 'orderDate',
      status: 'paymentStatus'
    },
    prepare({ title, subtitle, total, currency, orderDate, status }: any) {
      const statusIcon: Record<string, string> = {
        paid: '✅',
        pending: '⏳',
        partially_paid: '🔄',
        refunded: '↩️',
        partially_refunded: '🔄'
      }
      
      const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString() : 'Unknown date'
      const formattedTotal = `${currency} ${total?.toFixed(2) || '0.00'}`
      
      return {
        title: `Order ${title}`,
        subtitle: `${subtitle} • ${formattedTotal} • ${formattedDate}`,
        media: statusIcon[status] || '📦'
      }
    }
  }
}
