import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';

import PageComponentList from '~/components/PageComponentList';
import {PAGE_QUERY} from '~/groq/queries';

import {Query} from 'hydrogen-sanity';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.page.title ?? ''}`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...criticalData};
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

  const [data] = await Promise.all([
    context.sanity.query(PAGE_QUERY, {
      handle: params.handle,
    }),
  ]);

  if (!data) {
    throw new Response('Not Found', {status: 404});
  }

  // redirectIfHandleIsLocalized(request, {handle: params.handle, data: data});

  return {
    page: data,
  };
}

export default function Page() {
  const data = useLoaderData<typeof loader>();

  console.log('DATA', data.page);
  return (
    <div className="page">
      <Query query={PAGE_QUERY} options={{initial: data.page}}>
        {(data) => <PageComponentList components={data?.modules} />}
      </Query>
    </div>
  );
}
