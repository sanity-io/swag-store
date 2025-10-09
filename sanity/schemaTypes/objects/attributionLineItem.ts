import {defineField, defineType} from 'sanity';

export const attributionLineItemType = defineType({
  name: 'attributionLineItem',
  title: 'Line Item',
  type: 'object',
  fields: [
    defineField({
      name: 'lineId',
      title: 'Line ID',
      type: 'string',
    }),
    defineField({
      name: 'productTitle',
      title: 'Product',
      type: 'string',
    }),
    defineField({
      name: 'variantTitle',
      title: 'Variant',
      type: 'string',
    }),
    defineField({
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
    }),
    defineField({
      name: 'totalAmount',
      title: 'Line Total',
      type: 'attributionMoney',
    }),
    defineField({
      name: 'amountPerQuantity',
      title: 'Per Quantity',
      type: 'attributionMoney',
    }),
  ],
  preview: {
    select: {
      title: 'productTitle',
      variant: 'variantTitle',
      quantity: 'quantity',
    },
    prepare({title, variant, quantity}) {
      return {
        title: title ?? 'Unknown product',
        subtitle: [variant, quantity ? `Qty: ${quantity}` : null]
          .filter(Boolean)
          .join(' • '),
      };
    },
  },
});
