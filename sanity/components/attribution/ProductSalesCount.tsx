import {Badge, BadgeTone, Flex} from '@sanity/ui'
import {useEffect, useState} from 'react'
import {useClient, useFormValue} from 'sanity'

export const ProductSalesCountInput = () => {
  const [data, setData] = useState<ProductSalesCountProps[]>([])
  const x = useFormValue(['productMeta']) as {_ref: string}

  const client = useClient({apiVersion: '2023-05-03'})

  useEffect(() => {
    if (x._ref) {
      client.fetch(`*[_id == "${x._ref}"][0]`).then((res) => {
        setData([
          {value: res.salesValueToday, mode: 'today'},
          {value: res.salesValueLast7Days, mode: '7d'},
          {value: res.salesValueLast30Days, mode: '30d'},
          {value: res.salesValueTotal, mode: 'total'},
        ])
      })
    }
  }, [client, x])

  return (
    <Flex gap={4}>
      {data.map((datum) => (
        <ProductSalesCount key={datum.value} {...datum} />
      ))}
    </Flex>
  )
}

interface ProductSalesCountProps {
  value: number
  mode: 'today' | '7d' | '30d' | 'total'
}

const ProductSalesCount = ({value, mode}: ProductSalesCountProps) => {
  let label = 'Today'
  let tone: BadgeTone = 'positive'

  switch (mode) {
    case '7d': {
      label = 'Last 7 days'
      tone = 'primary'
      break
    }
    case '30d': {
      label = 'Last 30 days'
      tone = 'suggest'
      break
    }
    case 'total': {
      label = 'Total'
      tone = 'default'
      break
    }
  }

  return (
    <Badge tone={tone} radius={1} padding={3}>
      {`${label} – `}
      {`$${value}`}
    </Badge>
  )
}
