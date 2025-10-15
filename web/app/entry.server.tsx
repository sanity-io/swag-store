import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const projectId = context.env.SANITY_PROJECT_ID;
  const studioHostName =
    context.env.SANITY_STUDIO_HOST || 'http://localhost:3000';
  const storefrontOrigin =
    context.env.SANITY_STUDIO_STOREFRONT_ORIGIN || 'http://localhost:3000';
  const isPreviewEnabled = context.sanity.preview?.enabled;

  const {SanityProvider} = context.sanity;

  console.log('isPreviewEnabled', isPreviewEnabled);
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Allow Sanity assets loaded from the CDN to be loaded in your storefront
    defaultSrc: ['https://cdn.sanity.io'],
    // Allow Studio to load your storefront in Presentation's iframe
    // Also allow self for local development
    frameAncestors: isPreviewEnabled
      ? [studioHostName, storefrontOrigin, "'self'"]
      : [],
    // Allow client-side requests for Studio to do realtime collaboration
    connectSrc: [
      `https://${projectId}.api.sanity.io`,
      `wss://${projectId}.api.sanity.io`,
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <SanityProvider>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          nonce={nonce}
        />
      </SanityProvider>
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
