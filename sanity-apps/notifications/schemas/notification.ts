export const notification = {
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule: any) => rule.required().max(100)
    },
    {
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (rule: any) => rule.required().max(500)
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Success', value: 'success' },
          { title: 'Warning', value: 'warning' },
          { title: 'Error', value: 'error' }
        ],
        layout: 'radio'
      },
      validation: (rule: any) => rule.required()
    },
    {
      name: 'source',
      title: 'Source System',
      type: 'string',
      description: 'System or service that generated this notification'
    },
    {
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        {
          name: 'documentId',
          title: 'Related Document ID',
          type: 'string'
        },
        {
          name: 'action',
          title: 'Action Type',
          type: 'string'
        },
        {
          name: 'userId',
          title: 'User ID',
          type: 'string'
        }
      ]
    },
    {
      name: 'isRead',
      title: 'Is Read',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      initialValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date()
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'message',
      status: 'status',
      createdAt: 'createdAt'
    },
    prepare({ title, subtitle, status, createdAt }: any) {
      const statusIcon: Record<string, string> = {
        success: '✅',
        warning: '⚠️',
        error: '❌'
      }
      return {
        title: `${statusIcon[status] || '📢'} ${title}`,
        subtitle: subtitle,
        media: statusIcon[status]
      }
    }
  }
}
