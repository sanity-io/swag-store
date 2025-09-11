import React, {useState, useEffect} from 'react'
import {Card, Text, Badge, Stack, Spinner, Button, Flex, Box} from '@sanity/ui'
import {useClient, useFormValue} from 'sanity'
import {StringInputProps} from 'sanity'

interface Notification {
  _id: string
  title: string
  message: string
  status: 'success' | 'warning' | 'error'
  source: string
  createdAt: string
  metadata?: {
    postTitle?: string
    action?: string
    error?: string
  }
}

interface PostNotificationsProps extends StringInputProps {
  // Document context is available through documentId and documentType props
  // These are automatically provided by Sanity Studio
}

// Custom input component for Sanity Studio
export function PostNotificationsInput(props: PostNotificationsProps) {
  return <PostNotifications {...props} />
}

export function PostNotifications(props: PostNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const client = useClient({apiVersion: '2023-05-03'})

  // Use useFormValue hook to access document data
  const documentId = useFormValue(['_id']) as string
  const marketingCampaign = useFormValue(['marketingCampaign']) as {_ref: string} | undefined

  console.log('all props', props)
  console.log('documentId', documentId)
  console.log('marketingCampaign', marketingCampaign)
  console.log('props keys', Object.keys(props))

  useEffect(() => {
    if (documentId && marketingCampaign?._ref) {
      fetchNotifications()
    }
  }, [documentId, marketingCampaign?._ref])

  const fetchNotifications = async () => {
    if (!documentId || !marketingCampaign?._ref || !client) return

    try {
      setLoading(true)
      setError(null)

      // Query notifications that are related to this post's marketing campaign
      const notificationsQuery = `*[_type == "notification" && metadata.documentId == "${marketingCampaign._ref}" && !(_id in path("drafts.**"))] | order(createdAt desc) [0...10]`

      const results = await client.fetch(notificationsQuery)
      setNotifications(Array.isArray(results) ? results : [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to load notifications')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'positive'
      case 'warning':
        return 'caution'
      case 'error':
        return 'critical'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '📢'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!documentId) {
    return (
      <Card padding={3}>
        <Text>Save the post to see related notifications.</Text>
      </Card>
    )
  }

  if (!marketingCampaign?._ref) {
    return (
      <Card padding={3}>
        <Text>Create a marketing campaign for this post to see related notifications.</Text>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card padding={3}>
        <Flex align="center" gap={2}>
          <Spinner />
          <Text>Loading notifications...</Text>
        </Flex>
      </Card>
    )
  }

  if (error) {
    return (
      <Card padding={3} tone="critical">
        <Stack space={2}>
          <Text>{error}</Text>
          <Button text="Retry" onClick={fetchNotifications} />
        </Stack>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card padding={3}>
        <Text>No notifications found for this marketing campaign.</Text>
      </Card>
    )
  }

  return (
    <Card padding={3}>
      <Stack space={3}>
        <Flex justify="space-between" align="center">
          <Text weight="bold" size={1}>
            Recent Notifications ({notifications?.length || 0})
          </Text>
          <Button text="Refresh" onClick={fetchNotifications} />
        </Flex>

        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => {
            if (!notification || !notification._id) return null

            return (
              <Card key={notification._id} padding={2}>
                <Stack space={2}>
                  <Flex justify="space-between" align="flex-start">
                    <Flex gap={2} align="center">
                      <Text size={1}>{getStatusIcon(notification.status || 'success')}</Text>
                      <Text weight="medium" size={1}>
                        {notification.title || 'Untitled Notification'}
                      </Text>
                    </Flex>
                    <Badge tone={getStatusColor(notification.status || 'success')}>
                      {notification.status || 'unknown'}
                    </Badge>
                  </Flex>

                  <Text size={1} muted>
                    {notification.message || 'No message'}
                  </Text>

                  <Flex justify="space-between" align="center">
                    <Text size={0} muted>
                      {notification.createdAt ? formatDate(notification.createdAt) : 'Unknown date'}
                    </Text>
                    <Text size={0} muted>
                      {notification.source || 'Unknown source'}
                    </Text>
                  </Flex>

                  {notification.metadata?.error && (
                    <Box padding={2} style={{backgroundColor: '#fee2e2', borderRadius: '4px'}}>
                      <Text size={0} muted>
                        Error: {notification.metadata.error}
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Card>
            )
          })
        ) : (
          <Text size={1} muted>
            No notifications found for this marketing campaign.
          </Text>
        )}
      </Stack>
    </Card>
  )
}
