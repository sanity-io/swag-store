import {createClient} from '@sanity/client';
import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';

interface MoneyPayload {
  amount?: number;
  currencyCode?: string | null;
}

interface LinePayload {
  id?: string | null;
  quantity?: number | null;
  merchandiseId?: string | null;
  productId?: string | null;
  productTitle?: string | null;
  variantTitle?: string | null;
  totalAmount?: MoneyPayload | null;
  amountPerQuantity?: MoneyPayload | null;
}

interface AttributionRequestBody {
  sessionId?: string;
  pageId?: string;
  pageSlug?: string | null;
  pageTitle?: string | null;
  landingUrl?: string | null;
  landingTimestamp?: string | null;
  referrer?: string | null;
  utm?: Record<string, string> | null;
  cartId?: string | null;
  checkoutUrl?: string | null;
  totalQuantity?: number | null;
  totals?: {
    totalAmount?: MoneyPayload | null;
    subtotalAmount?: MoneyPayload | null;
    totalTaxAmount?: MoneyPayload | null;
    totalDutyAmount?: MoneyPayload | null;
  } | null;
  lines?: LinePayload[] | null;
}

function sanitizeMoney(input?: MoneyPayload | null) {
  if (!input) return undefined;
  const amount =
    typeof input.amount === 'number' && Number.isFinite(input.amount)
      ? Number(input.amount)
      : undefined;

  if (amount === undefined && !input.currencyCode) {
    return undefined;
  }

  return {
    amount,
    currencyCode: input.currencyCode ?? null,
  };
}

function sanitizeLines(lines?: LinePayload[] | null) {
  if (!Array.isArray(lines)) return [];
  return lines
    .map((line) => {
      if (!line) return null;
      return {
        _type: 'attributionLineItem',
        lineId: line.id ?? null,
        quantity:
          typeof line.quantity === 'number' && Number.isFinite(line.quantity)
            ? line.quantity
            : null,
        merchandiseId: line.merchandiseId ?? null,
        productId: line.productId ?? null,
        productTitle: line.productTitle ?? null,
        variantTitle: line.variantTitle ?? null,
        totalAmount: sanitizeMoney(line.totalAmount) ?? null,
        amountPerQuantity: sanitizeMoney(line.amountPerQuantity) ?? null,
      };
    })
    .filter(Boolean);
}

type NormalizedUtmEntry = {
  _key: string;
  key: string;
  value: string;
};

function normalizeUtm(utm?: Record<string, string> | null): NormalizedUtmEntry[] {
  if (!utm) return [];
  return Object.entries(utm)
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([key, value]) => ({
      _key: key.toLowerCase(),
      key: key.toLowerCase(),
      value: value.trim(),
    }));
}

export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: {'Allow': 'POST'},
    });
  }

  let body: AttributionRequestBody;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Invalid attribution event payload', error);
    return json({error: 'Invalid JSON payload'}, {status: 400});
  }

  if (!body || typeof body !== 'object') {
    return json({error: 'Missing payload'}, {status: 400});
  }

  const sessionId = body.sessionId?.trim();
  const pageId = body.pageId?.trim();

  if (!sessionId) {
    return json({error: 'Missing sessionId'}, {status: 400});
  }

  if (!pageId) {
    return json({error: 'Missing pageId'}, {status: 400});
  }

  const apiToken = context.env.SANITY_API_TOKEN;
  const projectId = context.env.SANITY_PROJECT_ID;
  const dataset = context.env.SANITY_DATASET;

  if (!apiToken || !projectId || !dataset) {
    console.error('Missing Sanity configuration for attribution event');
    return json({error: 'Server misconfiguration'}, {status: 500});
  }

  const currencyCode =
    body.totals?.totalAmount?.currencyCode ??
    body.totals?.subtotalAmount?.currencyCode ??
    null;

  const totalAmount = sanitizeMoney(body.totals?.totalAmount);
  const subtotalAmount = sanitizeMoney(body.totals?.subtotalAmount);

  const value = totalAmount?.amount ?? subtotalAmount?.amount ?? null;

  const document = {
    _type: 'attributionEvent',
    sessionId,
    page: {
      _type: 'reference',
      _ref: pageId,
    },
    pageSlug: body.pageSlug ?? null,
    pageTitle: body.pageTitle ?? null,
    landingUrl: body.landingUrl ?? null,
    landingTimestamp: body.landingTimestamp ?? new Date().toISOString(),
    referrer: body.referrer ?? null,
    utm: normalizeUtm(body.utm),
    cartId: body.cartId ?? null,
    checkoutUrl: body.checkoutUrl ?? null,
    totalQuantity:
      typeof body.totalQuantity === 'number' && Number.isFinite(body.totalQuantity)
        ? body.totalQuantity
        : null,
    value,
    currencyCode,
    totals: {
      totalAmount: totalAmount ?? null,
      subtotalAmount: subtotalAmount ?? null,
      totalTaxAmount: sanitizeMoney(body.totals?.totalTaxAmount) ?? null,
      totalDutyAmount: sanitizeMoney(body.totals?.totalDutyAmount) ?? null,
    },
    lineItems: sanitizeLines(body.lines ?? []),
    createdAt: new Date().toISOString(),
  };

  try {
    const client = createClient({
      projectId,
      dataset,
      apiVersion: context.env.SANITY_API_VERSION || '2025-08-27',
      token: apiToken,
      useCdn: false,
      perspective: 'raw',
    });

    const created = await client.create(document, {tag: 'attribution.event'});

    return json(
      {
        ok: true,
        id: created._id,
      },
      {status: 201},
    );
  } catch (error) {
    console.error('Failed to persist attribution event', error);
    return json({error: 'Failed to store attribution event'}, {status: 500});
  }
}

export const loader = () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: {'Allow': 'POST'},
  });
