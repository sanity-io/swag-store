import type {CartApiQueryFragment} from 'storefrontapi.generated';

const STORAGE_KEY = 'sq_attribution_first_click';
const STORAGE_VERSION = 1;
const STORAGE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export type StoredAttribution = {
  version: number;
  sessionId: string;
  pageId: string | null;
  pageSlug?: string;
  pageTitle?: string;
  landingUrl: string;
  landingTimestamp: string;
  referrer?: string;
  utm: Record<string, string>;
  lastUpdated: string;
  expiresAt: number;
  lastCheckoutAt?: string;
  lastCheckoutCartId?: string;
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function safeParse(value: string | null): StoredAttribution | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as StoredAttribution;
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (parsed.version !== STORAGE_VERSION) return null;
    if (typeof parsed.expiresAt === 'number' && parsed.expiresAt < Date.now()) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to parse stored attribution payload', error);
    return null;
  }
}

function writeStorage(payload: StoredAttribution | null) {
  if (!isBrowser()) return;
  if (!payload) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to persist attribution payload', error);
  }
}

export function getStoredAttribution(): StoredAttribution | null {
  if (!isBrowser()) return null;
  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!stored) {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return stored;
}

const SUPPORTED_QUERY_KEYS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_source_platform',
  'utm_creative_format',
  'utm_marketing_tactic',
  'gclid',
  'fbclid',
]);

function extractUtmFromSearch(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};

  params.forEach((value, key) => {
    if (!value) return;
    const normalizedKey = key.toLowerCase();
    if (SUPPORTED_QUERY_KEYS.has(normalizedKey) || normalizedKey.startsWith('utm_')) {
      utm[normalizedKey] = value;
    }
  });

  return utm;
}

export function captureLandingAttribution({
  pageId,
  pageSlug,
  pageTitle,
}: {
  pageId: string;
  pageSlug?: string;
  pageTitle?: string;
}) {
  if (!isBrowser()) return;

  const now = new Date();
  const stored = getStoredAttribution();
  const utmParams = extractUtmFromSearch(window.location.search);
  const hasNewUtm = Object.keys(utmParams).length > 0;
  const hasStoredUtm = stored ? Object.keys(stored.utm ?? {}).length > 0 : false;

  const base: StoredAttribution = stored ?? {
    version: STORAGE_VERSION,
    sessionId: createSessionId(),
    pageId: pageId ?? null,
    pageSlug,
    pageTitle,
    landingUrl: window.location.href,
    landingTimestamp: now.toISOString(),
    referrer: document.referrer || undefined,
    utm: hasNewUtm ? utmParams : {},
    lastUpdated: now.toISOString(),
    expiresAt: now.getTime() + STORAGE_TTL_MS,
  };

  let updatedPayload = base;
  let shouldPersist = !stored;

  if (stored) {
    updatedPayload = {
      ...stored,
      lastUpdated: now.toISOString(),
      expiresAt: stored.expiresAt || now.getTime() + STORAGE_TTL_MS,
    };

    if (!stored.pageId && pageId) {
      updatedPayload.pageId = pageId;
      shouldPersist = true;
    }

    if (!stored.pageSlug && pageSlug) {
      updatedPayload.pageSlug = pageSlug;
      shouldPersist = true;
    }

    if (!stored.pageTitle && pageTitle) {
      updatedPayload.pageTitle = pageTitle;
      shouldPersist = true;
    }

    if (hasNewUtm && !hasStoredUtm) {
      updatedPayload.utm = utmParams;
      shouldPersist = true;
    }

    if (!stored.landingUrl) {
      updatedPayload.landingUrl = window.location.href;
      shouldPersist = true;
    }

    if (!stored.landingTimestamp) {
      updatedPayload.landingTimestamp = now.toISOString();
      shouldPersist = true;
    }

    if (!stored.referrer) {
      updatedPayload.referrer = document.referrer || undefined;
      shouldPersist = true;
    }
  }

  if (shouldPersist) {
    writeStorage(updatedPayload);
  }
}

function mapMoney(money?: {amount?: string | null; currencyCode?: string | null}) {
  if (!money) return undefined;
  const amount = typeof money.amount === 'string' ? Number(money.amount) : undefined;
  return {
    amount: Number.isFinite(amount) ? amount : undefined,
    currencyCode: money.currencyCode ?? undefined,
  };
}

function mapCartLines(cart: CartApiQueryFragment | null | undefined) {
  const nodes = cart?.lines?.nodes;
  if (!Array.isArray(nodes)) return [];
  return nodes.map((line) => {
    const totalAmount = mapMoney(line?.cost?.totalAmount ?? undefined);
    const perQuantity = mapMoney(line?.cost?.amountPerQuantity ?? undefined);
    const merchandise: any = line?.merchandise ?? {};
    const product: any = merchandise?.product ?? {};

    return {
      id: line?.id,
      quantity: line?.quantity,
      merchandiseId: merchandise?.id,
      productId: product?.id,
      productTitle: product?.title,
      variantTitle: merchandise?.title,
      totalAmount,
      amountPerQuantity: perQuantity,
    };
  });
}

export function sendCheckoutAttributionEvent(
  cart: CartApiQueryFragment | null,
  options?: {
    endpoint?: string;
    clearOnSuccess?: boolean;
    extra?: Record<string, unknown>;
  },
) {
  if (!isBrowser()) return;

  const stored = getStoredAttribution();
  if (!stored || !stored.pageId) return;

  const nowIso = new Date().toISOString();
  const totalAmount =
    mapMoney(cart?.cost?.totalAmount ?? undefined) ??
    mapMoney(cart?.cost?.subtotalAmount ?? undefined);

  const payload = {
    sessionId: stored.sessionId,
    pageId: stored.pageId,
    pageSlug: stored.pageSlug,
    pageTitle: stored.pageTitle,
    landingUrl: stored.landingUrl,
    landingTimestamp: stored.landingTimestamp,
    referrer: stored.referrer,
    utm: stored.utm,
    cartId: cart?.id,
    checkoutUrl: cart?.checkoutUrl,
    totalQuantity: cart?.totalQuantity,
    totals: {
      totalAmount,
      subtotalAmount: mapMoney(cart?.cost?.subtotalAmount ?? undefined),
      totalTaxAmount: mapMoney(cart?.cost?.totalTaxAmount ?? undefined),
      totalDutyAmount: mapMoney(cart?.cost?.totalDutyAmount ?? undefined),
    },
    lines: mapCartLines(cart),
    lastUpdated: nowIso,
    ...options?.extra,
  };

  const body = JSON.stringify(payload);
  const endpoint = options?.endpoint ?? '/api/attribution-event';
  let sent = false;

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([body], {type: 'application/json'});
      sent = navigator.sendBeacon(endpoint, blob);
    } catch (error) {
      console.warn('Failed to send attribution beacon', error);
    }
  }

  if (!sent) {
    fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body,
      keepalive: true,
    }).catch((error) => {
      console.warn('Failed to post attribution event', error);
    });
  }

  writeStorage({
    ...stored,
    lastCheckoutAt: nowIso,
    lastCheckoutCartId: cart?.id ?? stored.lastCheckoutCartId,
  });

  if (options?.clearOnSuccess) {
    writeStorage(null);
  }
}
