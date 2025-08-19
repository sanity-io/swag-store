import {defineField, defineType} from 'sanity'

export const marketingCampaignType = defineType({
  name: 'marketingCampaign',
  title: 'Marketing Campaign',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'post',
      title: 'Post Content',
      type: 'reference',
      to: [{type: 'post'}],
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Ready', value: 'ready'},
          {title: 'Sent', value: 'sent'},
        ],
      },
      validation: (Rule: any) => Rule.required(),
      initialValue: 'draft',
    }),
    defineField({
      name: 'templateId',
      title: 'Klaviyo Template ID',
      type: 'string',
      description: 'The template ID from Klaviyo',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'campaignId',
      title: 'Klaviyo Campaign ID',
      type: 'string',
      description: 'The campaign ID from Klaviyo',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'listId',
      title: 'Klaviyo List ID',
      type: 'string',
      description: 'The list ID from Klaviyo that this campaign will be sent to',
      validation: (Rule: any) => Rule.required(),
    }),
  ],
})
