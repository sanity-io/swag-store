import {defineField, defineType} from 'sanity'

export const attributionMoneyType = defineType({
  name: 'attributionMoney',
  title: 'Money Value',
  type: 'object',
  fields: [
    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'number',
    }),
    defineField({
      name: 'currencyCode',
      title: 'Currency',
      type: 'string',
      validation: (Rule) => Rule.max(8),
    }),
  ],
  preview: {
    select: {
      amount: 'amount',
      currency: 'currencyCode',
    },
    prepare({amount, currency}) {
      if (typeof amount === 'number') {
        return {
          title: currency ? `${currency} ${amount.toFixed(2)}` : amount.toFixed(2),
        }
      }
      return {
        title: currency ? `${currency} —` : 'No amount',
      }
    },
  },
})
