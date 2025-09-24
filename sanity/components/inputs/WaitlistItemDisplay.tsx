import React, {useEffect, useState} from 'react'
import {useClient} from 'sanity'
import {Card, Text, Badge, Stack, Flex, Spinner, Button, Box} from '@sanity/ui'
import {ArrayOfObjectsInputProps} from 'sanity'
import {AddIcon, TrashIcon, DragHandleIcon} from '@sanity/icons'

interface WaitlistItem {
  _key: string
  productVariant?: {
    _ref: string
  }
  dateAdded?: string
}

interface WaitlistItemDisplayProps extends ArrayOfObjectsInputProps {
  value: WaitlistItem[]
}

export function WaitlistItemDisplay(props: WaitlistItemDisplayProps) {
  const {value = [], onChange, onInsert, onItemMove, onItemRemove, readOnly} = props
  const client = useClient({apiVersion: '2025-08-27'})
  const [itemsData, setItemsData] = useState<
    Array<{
      variantTitle?: string
      productTitle?: string
      productId?: number
      dateAdded?: string
    }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (value && value.length > 0) {
      // Fetch data for all waitlist items
      const variantIds = value.map((item) => item.productVariant?._ref).filter(Boolean)
      console.log(variantIds)
      if (variantIds.length > 0) {
        client
          .fetch(
            `*[_id in $variantIds]{
              _id,
              "variantTitle": store.title,
              "productId": store.productId,
              "productTitle": *[_type == "product" && references(^._id)][0].store.title
            }`,
            {variantIds},
          )
          .then((data: any[]) => {
            // Map the fetched data back to the original items with their dates
            const mappedData = value.map((item) => {
              const variantData = data.find((d) => d && d._id === item.productVariant?._ref)
              return {
                ...variantData,
                dateAdded: item.dateAdded,
              }
            })
            setItemsData(mappedData)
            setLoading(false)
          })
          .catch(() => {
            setItemsData([])
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [client, value])

  if (loading) {
    return (
      <Card padding={3}>
        <Flex align="center" gap={2}>
          <Spinner />
          <Text>Loading waitlist items...</Text>
        </Flex>
      </Card>
    )
  }

  if (!value || value.length === 0) {
    return (
      <Card padding={3}>
        <Text muted>No waitlist items</Text>
      </Card>
    )
  }

  console.log(itemsData)

  return (
    <Stack space={3}>
      {itemsData.map((item, index) => {
        const displayTitle = item.productTitle
          ? `${item.productTitle} - ${item.variantTitle || 'Variant'}`
          : item.variantTitle || 'Product Variant'

        return (
          <Card key={value[index]?._key || index} padding={3} radius={2} shadow={1}>
            <Flex align="center" gap={2}>
              {/* Drag handle for reordering */}
              {!readOnly && (
                <Box style={{cursor: 'grab'}}>
                  <DragHandleIcon />
                </Box>
              )}

              {/* Item content */}
              <Box flex={1}>
                <Stack space={2}>
                  <Text weight="bold" size={1}>
                    {displayTitle}
                  </Text>
                  <Flex gap={2} wrap="wrap">
                    {item.productId && (
                      <Badge tone="primary" size={0}>
                        Product ID: {item.productId}
                      </Badge>
                    )}
                    {item.dateAdded && (
                      <Badge tone="neutral" size={0}>
                        Added: {new Date(item.dateAdded).toLocaleDateString()}
                      </Badge>
                    )}
                  </Flex>
                </Stack>
              </Box>

              {/* Remove button */}
              {!readOnly && onItemRemove && (
                <Button
                  icon={TrashIcon}
                  mode="ghost"
                  tone="critical"
                  size={0}
                  onClick={() => onItemRemove(value[index]._key)}
                  title="Remove item"
                />
              )}
            </Flex>
          </Card>
        )
      })}

      {/* Add button */}
      {!readOnly && onChange && (
        <Box>
          <Button
            icon={AddIcon}
            mode="ghost"
            text="Add waitlist item"
            onClick={() => {
              const newItem = {
                _type: 'waitlistItem',
                _key: `item-${Date.now()}`,
                productVariant: undefined,
                dateAdded: new Date().toISOString(),
              }
              onChange([...value, newItem] as any)
            }}
          />
        </Box>
      )}
    </Stack>
  )
}
