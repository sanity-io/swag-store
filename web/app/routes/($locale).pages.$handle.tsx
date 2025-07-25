import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

import PageComponentList from '~/components/PageComponentList';
import {PAGE_QUERY} from '~/groq/queries';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.page.title ?? ''}`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  request,
  params,
}: LoaderFunctionArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const {data} = await context.sanity.loadQuery(PAGE_QUERY, {
    handle: params.handle,
  });

  console.log('data', data);

  // const [{page}] = await Promise.all([
  //   context.storefront.query(PAGE_QUERY, {
  //     variables: {
  //       handle: params.handle,
  //     },
  //   }),
  //   // Add other queries here, so that they are loaded in parallel
  // ]);

  if (!data) {
    throw new Response('Not Found', {status: 404});
  }

  // redirectIfHandleIsLocalized(request, {handle: params.handle, data: data});

  return {
    page: data,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();
  const modules = page?.modules;

  return (
    <div className="page">
      <PageComponentList components={modules} />
    </div>
  );
}
