import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | demo`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  // const criticalData = await loadCriticalData(args);

  return {...deferredData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
// async function loadCriticalData({
//   context,
//   request,
//   params,
// }: LoaderFunctionArgs) {
//   if (!params.handle) {
//     throw new Error('Missing page handle');
//   }

//   const [{page}] = await Promise.all([
//     context.storefront.query(PAGE_QUERY, {
//       variables: {
//         handle: params.handle,
//       },
//     }),
//     // Add other queries here, so that they are loaded in parallel
//   ]);

//   if (!page) {
//     throw new Response('Not Found', {status: 404});
//   }

//   redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

//   return {
//     page,
//   };
// }

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Page() {
  // const {page} = useLoaderData<typeof loader>();

  return (
    <div className="page bg-brand-green h-[calc(100vh-40px)]">
      <div className="grid grid-cols-3 h-full gap-4">
        <div
          className="col-span-1"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '482px 444px',
            backgroundRepeat: 'repeat',
          }}
        >
          <div className="aspect-video w-full bg-brand-green mt-20">
            <div className="flex flex-col items-center justify-center h-full">
              <span className="font-mono font-normal text-14 uppercase">
                Information
              </span>
            </div>
          </div>
          <div className="min-w-[80vw] mt-2 p-4">
            <p className="text-24 font-sans font-normal leading-none">
              Curabitur mauris quam, volutpat a molestie scelerisque,
              scelerisque et sem. Nunc vitae felis tincidunt, laoreet nunc sed,
              vestibulum purus. Ut viverra leo nulla, nec malesuada enim
              pellentesque id. Integer laoreet urna id augue vulputate, eget
              mollis tellus cursus.
            </p>
          </div>
        </div>
        <div
          className="col-span-2 grid-cols-2 flex flex-col justify-between"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '482px 444px',
            backgroundRepeat: 'repeat',
          }}
        >
          <div className="mt-20 p-4">
            <h1 className="font-sans !mt-0 font-normal text-56 leading-none ">
              Lorem ipsum dolor sit amet, consectetur elit.
            </h1>
          </div>
          <div className="grid grid-cols-2 mb-[40px]">
            <div className="col-span-1 col-start-2 bg-brand-green p-4">
              <div className="flex items-start">
                <span className="font-mono font-normal text-14 inline-block mr-10 uppercase">
                  LINKS
                </span>
                <a
                  href="https://sanity.io"
                  className="text-56 font-sans mt-0 leading-none"
                >
                  Sanity.io
                </a>
              </div>

              <a
                href="https://sanity.io"
                className="text-56 font-sans block mt-0 leading-none"
              >
                Contact Sales
              </a>

              <a
                href="https://sanity.io"
                className="text-56 font-sans block mt-0 leading-none"
              >
                Get Started
              </a>
              <div className="h-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
