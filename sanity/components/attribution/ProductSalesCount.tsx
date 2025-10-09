import {useState, useEffect} from 'react'
import {Badge, BadgeTone, Card, Button, Flex} from '@sanity/ui'
import {WarningOutlineIcon} from '@sanity/icons'
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

  const [step, setStep] = useState<'analyze' | 'analyze-success' | 'do-action'>('analyze')

  return (
    <>
      <Flex gap={4}>
        {data.map((datum) => (
          <ProductSalesCount key={datum.value} {...datum} />
        ))}
      </Flex>
      <div style={{marginTop: '30px'}}>
        <Card padding={[3, 3, 4]} radius={2} shadow={1} tone="caution">
          {step === 'analyze' && (
            <div>
              <p>
                <WarningOutlineIcon />
                We don't have any sales data for this product in the last 7 days.
              </p>
              <Button onClick={() => setStep('analyze-success')}>Analyze this Product</Button>
            </div>
          )}
          {step === 'analyze-success' && (
            <div>
              <p>We have analyzed this product and found that sales have decreased.</p>
              <strong>Ai Inferred Reason:</strong>
              <ul>
                <li>
                  There is a campaign running on collections/sales that this product is not included
                  in and that could be lowering sales values.
                </li>
                <li>
                  We found a competiting or wholesale partner that is selling the same product at a
                  lower price at competitor.com/products/crew-neck shirt
                </li>
              </ul>
              <Button onClick={() => setStep('do-action')}>Lower Price to Match Competitor</Button>
              <Button onClick={() => setStep('analyze')}>Deeper Analyze</Button>
            </div>
          )}
          {step === 'do-action' && (
            <div>
              <p>We have lowered the price of this product to match the competitor.</p>
              <Button onClick={() => setStep('analyze')}>Analyze this Product Further?</Button>
            </div>
          )}
        </Card>
      </div>
    </>
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
