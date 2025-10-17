import {defineField, defineType} from 'sanity'

export const notification = defineType({
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Success', value: 'success'},
          {title: 'Warning', value: 'warning'},
          {title: 'Error', value: 'error'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source System',
      type: 'string',
      description: 'System or service that generated this notification',
    }),
    defineField({
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        defineField({
          name: 'documentId',
          title: 'Related Document ID',
          type: 'string',
        }),
        defineField({
          name: 'action',
          title: 'Action Type',
          type: 'string',
        }),
        defineField({
          name: 'userId',
          title: 'User ID',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'isRead',
      title: 'Read Status',
      type: 'string',
      options: {
        list: [
          {title: 'Unread', value: 'unread'},
          {title: 'Read', value: 'read'},
        ],
        layout: 'radio',
      },
      initialValue: 'unread',
      description: 'Whether the notification has been read',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      initialValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'message',
      status: 'status',
      createdAt: 'createdAt',
    },
    prepare({title, subtitle, status, createdAt}) {
      const statusIcon = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
      }
      return {
        title: `${statusIcon[status as keyof typeof statusIcon] || '📢'} ${title}`,
        subtitle: subtitle,
        media: statusIcon[status as keyof typeof statusIcon],
      }
    },
  },
})
