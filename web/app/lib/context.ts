import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {getLocaleFromRequest, getSupportedLocales} from '~/lib/i18n';
import {createSanityContext} from 'hydrogen-sanity';

import {PreviewSession} from 'hydrogen-sanity/preview/session';
import {isPreviewEnabled} from 'hydrogen-sanity/preview';

import {filter} from './sanity/stega';

const additionalContext = {
  sanity: null as any, // Will be set below
} as const;

type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
}

export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session, previewSession] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
    PreviewSession.init(request, [env.SESSION_SECRET]),
  ]);

  const sanity = await createSanityContext({
    request,
    cache,
    waitUntil,
    client: {
      projectId: env.SANITY_PROJECT_ID,
      dataset: env.SANITY_DATASET,
      apiVersion: env.SANITY_API_VERSION || '2025-08-27',
      token: env.SANITY_API_TOKEN,
      useCdn: true,
      stega: {
        enabled: isPreviewEnabled(env.SANITY_PROJECT_ID, previewSession),
        filter,
        studioUrl: env.SANITY_STUDIO_HOST || 'http://localhost:3333',
      }
    },
    preview: {
      token: env.SANITY_API_TOKEN,
      session: previewSession,
    } 
  });

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      i18n: getLocaleFromRequest(request),
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    { ...additionalContext, sanity }
  );

  // Initialize supported locales in the background
  // This will cache the locales for future requests
  if (hydrogenContext.storefront && typeof hydrogenContext.storefront.query === 'function') {
    getSupportedLocales(hydrogenContext.storefront).catch((error) => {
      console.error('Failed to initialize supported locales:', error);
    });
  } else {
    console.warn('Storefront client not available for localization initialization');
  }

  return hydrogenContext;
}

// Keep the old function for backward compatibility during migration
export async function createAppLoadContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  return createHydrogenRouterContext(request, env, executionContext);
}
