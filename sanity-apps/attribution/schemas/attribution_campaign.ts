export const attribution_campaign = {
  name: 'attribution_campaign',
  title: 'Attribution Campaign',
  type: 'document',
  fields: [
    {
      name: 'campaignName',
      title: 'Campaign Name',
      type: 'string',
      validation: (rule: any) => rule.required().max(100),
      description: 'Name of the attribution campaign'
    },
    {
      name: 'campaignDescription',
      title: 'Campaign Description',
      type: 'text',
      description: 'Description of what this campaign is tracking'
    },
    {
      name: 'associatedPage',
      title: 'Associated Page',
      type: 'reference',
      to: [
        { type: 'page' },
        { type: 'product' },
        { type: 'collection' }
      ],
      validation: (rule: any) => rule.required(),
      description: 'The page, product, or collection this campaign is associated with'
    },
    {
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      validation: (rule: any) => rule.required(),
      description: 'Title of the associated page for easy identification'
    },
    {
      name: 'pageUrl',
      title: 'Page URL',
      type: 'url',
      description: 'Full URL of the associated page'
    },
    {
      name: 'utmParameters',
      title: 'UTM Parameters',
      type: 'object',
      fields: [
        {
          name: 'utm_source',
          title: 'UTM Source',
          type: 'string',
          validation: (rule: any) => rule.required(),
          description: 'e.g., newsletter, facebook, google'
        },
        {
          name: 'utm_medium',
          title: 'UTM Medium',
          type: 'string',
          validation: (rule: any) => rule.required(),
          description: 'e.g., email, cpc, social'
        },
        {
          name: 'utm_campaign',
          title: 'UTM Campaign',
          type: 'string',
          validation: (rule: any) => rule.required(),
          description: 'Campaign identifier'
        },
        {
          name: 'utm_content',
          title: 'UTM Content',
          type: 'string',
          description: 'Content identifier or ad variation'
        },
        {
          name: 'utm_term',
          title: 'UTM Term',
          type: 'string',
          description: 'Search term or keyword'
        }
      ],
      validation: (rule: any) => rule.required(),
      description: 'UTM parameters for this campaign'
    },
    {
      name: 'generatedUrl',
      title: 'Generated URL',
      type: 'url',
      description: 'Complete URL with UTM parameters that can be copied and used',
      readOnly: true
    },
    {
      name: 'campaignStatus',
      title: 'Campaign Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Active', value: 'active' },
          { title: 'Paused', value: 'paused' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' }
        ],
        layout: 'radio'
      },
      initialValue: 'draft',
      validation: (rule: any) => rule.required()
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'When this campaign should start tracking'
    },
    {
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'When this campaign should stop tracking'
    },
    {
      name: 'revenueMetrics',
      title: 'Revenue Metrics',
      type: 'object',
      fields: [
        {
          name: 'totalRevenue',
          title: 'Total Revenue',
          type: 'number',
          initialValue: 0,
          description: 'Total revenue attributed to this campaign'
        },
        {
          name: 'totalOrders',
          title: 'Total Orders',
          type: 'number',
          initialValue: 0,
          description: 'Total number of orders attributed to this campaign'
        },
        {
          name: 'averageOrderValue',
          title: 'Average Order Value',
          type: 'number',
          initialValue: 0,
          description: 'Average value per order for this campaign'
        },
        {
          name: 'conversionRate',
          title: 'Conversion Rate',
          type: 'number',
          initialValue: 0,
          description: 'Conversion rate for this campaign',
          validation: (rule: any) => rule.min(0).max(1)
        },
        {
          name: 'lastUpdated',
          title: 'Last Updated',
          type: 'datetime',
          description: 'When these metrics were last updated'
        }
      ],
      description: 'Revenue and conversion metrics for this campaign'
    },
    {
      name: 'productReferences',
      title: 'Product References',
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
              validation: (rule: any) => rule.required()
            },
            {
              name: 'productTitle',
              title: 'Product Title',
              type: 'string',
              validation: (rule: any) => rule.required()
            },
            {
              name: 'salesData',
              title: 'Sales Data',
              type: 'object',
              fields: [
                {
                  name: 'quantitySold',
                  title: 'Quantity Sold',
                  type: 'number',
                  initialValue: 0
                },
                {
                  name: 'revenue',
                  title: 'Revenue',
                  type: 'number',
                  initialValue: 0
                },
                {
                  name: 'ordersCount',
                  title: 'Orders Count',
                  type: 'number',
                  initialValue: 0
                },
                {
                  name: 'lastUpdated',
                  title: 'Last Updated',
                  type: 'datetime'
                }
              ]
            }
          ]
        }
      ],
      description: 'Products associated with this campaign and their sales data'
    },
    {
      name: 'trackingSettings',
      title: 'Tracking Settings',
      type: 'object',
      fields: [
        {
          name: 'trackAddToCart',
          title: 'Track Add to Cart',
          type: 'boolean',
          initialValue: true,
          description: 'Whether to track add to cart events'
        },
        {
          name: 'trackPageViews',
          title: 'Track Page Views',
          type: 'boolean',
          initialValue: true,
          description: 'Whether to track page view events'
        },
        {
          name: 'trackOrders',
          title: 'Track Orders',
          type: 'boolean',
          initialValue: true,
          description: 'Whether to track order events'
        },
        {
          name: 'attributionWindow',
          title: 'Attribution Window (days)',
          type: 'number',
          initialValue: 30,
          description: 'How many days after the campaign interaction to attribute sales'
        }
      ],
      description: 'Settings for what events to track for this campaign'
    },
    {
      name: 'webhookSettings',
      title: 'Webhook Settings',
      type: 'object',
      fields: [
        {
          name: 'webhookUrl',
          title: 'Webhook URL',
          type: 'url',
          description: 'URL to send webhook data to'
        },
        {
          name: 'webhookSecret',
          title: 'Webhook Secret',
          type: 'string',
          description: 'Secret for webhook authentication'
        },
        {
          name: 'isWebhookActive',
          title: 'Is Webhook Active',
          type: 'boolean',
          initialValue: false,
          description: 'Whether webhook notifications are enabled'
        }
      ],
      description: 'Webhook configuration for this campaign'
    },
    {
      name: 'createdBy',
      title: 'Created By',
      type: 'string',
      description: 'User who created this campaign'
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
      title: 'campaignName',
      subtitle: 'pageTitle',
      status: 'campaignStatus',
      revenue: 'revenueMetrics.totalRevenue',
      orders: 'revenueMetrics.totalOrders',
      startDate: 'startDate'
    },
    prepare({ title, subtitle, status, revenue, orders, startDate }: any) {
      const statusIcon: Record<string, string> = {
        draft: '📝',
        active: '🚀',
        paused: '⏸️',
        completed: '✅',
        cancelled: '❌'
      }
      
      const formattedDate = startDate ? new Date(startDate).toLocaleDateString() : 'No start date'
      const revenueText = revenue ? `$${revenue.toFixed(2)}` : '$0.00'
      const ordersText = orders ? `${orders} orders` : '0 orders'
      
      return {
        title: `${statusIcon[status] || '📝'} ${title}`,
        subtitle: `${subtitle} • ${revenueText} • ${ordersText} • ${formattedDate}`,
        media: statusIcon[status] || '📝'
      }
    }
  }
}
