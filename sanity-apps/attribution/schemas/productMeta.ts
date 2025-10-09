export const productMeta = {
  name: 'productMeta',
  title: 'Product Meta',
  type: 'document',
  fields: [
    {
      name: 'salesCountToday',
      title: 'Sales Count Today',
      type: 'number',
      description: 'Number of sales recorded today.',
      initialValue: 0,
      validation: (rule: any) => rule.min(0)
    },
    {
      name: 'salesValueToday',
      title: 'Sales Value Today',
      type: 'number',
      description: 'Total revenue from sales today.',
      initialValue: 0,
      validation: (rule: any) => rule.min(0)
    },
    {
      name: 'salesCountLast7Days',
      title: 'Sales Count (Last 7 Days)',
      type: 'number',
      description: 'Number of sales recorded over the last 7 days.',
      initialValue: 0,
      validation: (rule: any) => rule.min(0)
    },
    {
      name: 'salesValueLast7Days',
      title: 'Sales Value (Last 7 Days)',
      type: 'number',
      description: 'Total revenue from sales over the last 7 days.',
      initialValue: 0,
      validation: (rule: any) => rule.min(0)
    },
    {
      name: 'salesCountLast30Days',
      title: 'Sales Count (Last 30 Days)',
      type: 'number',
      description: 'Number of sales recorded over the last 30 days.',
      initialValue: 0,
      validation: (rule: any) => rule.min(0)
    },
    {
      name: 'salesValueLast30Days',
      title: 'Sales Value (Last 30 Days)',
      type: 'number',
      description: 'Total revenue from sales over the last 30 days.',
      initialValue: 0,
      validation: (rule: any) => rule.min(0)
    },
    {
      name: 'lastSaleDate',
      title: 'Last Sale Date',
      type: 'datetime',
      description: 'Timestamp of the most recent sale for this product.'
    }
  ]
}
