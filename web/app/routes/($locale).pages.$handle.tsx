import {type LoaderFunctionArgs} from 'react-router';
import {useLoaderData, type MetaFunction, useLocation} from 'react-router';
import {useEffect} from 'react';

import PageComponentList from '~/components/PageComponentList';
import {PAGE_QUERY} from '~/groq/queries';

import {Query} from 'hydrogen-sanity';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Sanity Market | ${data?.page.title ?? ''}`}];
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
  const location = useLocation();

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    const scrollToTop = () => {
      // Try multiple methods
      window.scrollTo(0, 0);
      window.scrollTo({top: 0, left: 0, behavior: 'instant'});
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Try scrolling the main element if it exists
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }

      // Try scrolling the root element
      const rootElement = document.querySelector('#root');
      if (rootElement) {
        rootElement.scrollTop = 0;
      }
    };

    // Try immediately and after delays
    scrollToTop();
    setTimeout(scrollToTop, 100);
    // setTimeout(scrollToTop, 500);
  }, [location.pathname]); // Re-run when pathname changes

  return (
    <div className="page">
      <Query query={PAGE_QUERY} options={{initial: data.page}}>
        {(data) => <PageComponentList components={data?.modules} />}
      </Query>
    </div>
  );
}
