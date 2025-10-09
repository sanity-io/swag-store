import {Badge, BadgeTone, Flex} from '@sanity/ui'

export const ProductSalesCountInput = () => {
  const data = [
    {value: 1, mode: '7d'},
    {value: 2, mode: '30d'},
    {value: 3, mode: 'total'},
  ] as const

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
  mode: '7d' | '30d' | 'total'
}

const ProductSalesCount = ({value, mode}: ProductSalesCountProps) => {
  let label = 'Last 7 days'
  let tone: BadgeTone = 'primary'

  switch (mode) {
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
