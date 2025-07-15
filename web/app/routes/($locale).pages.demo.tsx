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
    <div className="page ">
      <div className="bg-brand-green min-h-[calc(100vh-40px)]">
        <div className="grid grid-cols-3 min-h-[calc(100vh)] gap-4">
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
            <div className="min-w-[80vw] mt-2 p-4"></div>
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
                How Sanity powers fast, flexible, API-first storefronts.
              </h1>
            </div>
            <div className="grid grid-cols-2 mb-[40px]">
              <div className="col-span-1 col-start-2 bg-brand-green p-4">
                <div>
                  <p className="my-4 block uppercase py-2">
                    We wanted to craft a pratical example of the best in class
                    ecommerce experience paired with Sanity and Shopify. We
                    choose to leverage Hydrogen, a Shopify-first framework for
                    building out a bespoke headless experience.
                  </p>

                  <p className="my-4 block uppercase py-2">
                    We leveraged existing starters/guides to quickly build a
                    headless storefront that suited our exact needs, elevated
                    our product offering and allowed us to tap into the endless
                    possibilities of API-first ecommerce experiences. We wanted
                    to both offer products to our fans as well as help new users
                    browse/learn about the ease of building beautiful
                    experiences and unravel the stigma that going
                    headless(api-based) is reserved for enterprise clients.
                  </p>
                </div>
                {/* <div className="flex items-start">
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
                <div className="h-20" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray min-h-[calc(100vh-40px)]">
        <div className="flex flex-col justify-between p-4">
          <h5 className="text-14 uppercase">Store TEch</h5>
          <h3 className="text-30 mt-[180px] font-sans">
            We built this experience using readily available tooling in the
            Sanity & Hydrogen ecosystem. Feel free to browse the GitHub directly
            or fork it for your own testing. We’ve written a blog article about
            the swag store that will showcase some of the changes we made from
            our core offerings.
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div
            className="col-span-2 grid grid-cols-2 gap-4"
            style={{
              backgroundImage: 'url(/images/grid-bg.png)',
              backgroundSize: '482px 444px',
              backgroundRepeat: 'repeat',
            }}
          >
            <div className="col-span-1 col-start-2 p-4 flex flex-col gap-4">
              <div className="bg-gray h-[200px] p-4">
                <p className="uppercase mt-[100px]">
                  Use our Shopify plugin to quickly add products to your sanity
                  schema, use the out of the box sync or write your own to
                  control how the data shows up in your studio
                </p>
              </div>

              <div className="bg-gray h-[200px] p-4">
                <p className="uppercase mt-[100px]">
                  Starting from scratch? use our starter to bootstrap a sanity
                  studio and frontend powered by next or Hydrogen
                </p>
              </div>
              <div className="bg-gray h-[200px] p-4">
                <p className="uppercase mt-[100px]">
                  Need a primer before diving in? we have a great guide into
                  setting up your first Sanity and Hydrogen Expereince
                </p>
              </div>
            </div>
          </div>

          <div
            className="col-span-1"
            style={{
              backgroundImage: 'url(/images/grid-bg.png)',
              backgroundSize: '482px 444px',
              backgroundRepeat: 'repeat',
            }}
          ></div>
        </div>
      </div>

      <div className="bg-black min-h-[calc(100vh-40px)]">
        <div className="flex flex-col justify-between p-4">
          <span className="text-14 uppercase text-white text-center p-10">
            Powered by Sanity
          </span>
        </div>
        <div
          className="grid grid-cols-3 gap-4 p-4 bg-gray/40"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '482px 444px',
            backgroundRepeat: 'repeat',
          }}
        >
          {logos.map((logo) => (
            <div className="col-span-1 bg-black aspect-video flex items-center justify-center">
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-w-[140px] h-auto"
              />
            </div>
          ))}
        </div>
        <div className="p-4 text-white">
          <span className="text-14 uppercase">Collaborations</span>
          <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-[100px] p-[100px]">
            {collaborations.map((collaboration) => (
              <div className="bg-black p-4">
                <img
                  className="w-full"
                  src={collaboration.artwork}
                  alt={collaboration.name}
                />
                <div className="flex flex-col gap-2 my-4">
                  <span className="text-14 uppercase">
                    {collaboration.name}
                  </span>
                  <span className="text-14">{collaboration.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-gray min-h-[calc(100vh-40px)]">
        <div className="grid grid-cols-3 h-full gap-0">
          <div className="col-span-2 p-4">
            <span>FAQ</span>
          </div>
          <div
            className="col-span-1"
            style={{
              backgroundImage: 'url(/images/grid-bg.png)',
              backgroundSize: '482px 444px',
              backgroundRepeat: 'repeat',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

const logos = [
  {
    src: '/images/ds.svg',
    alt: 'DS',
  },
  {
    src: '/images/vacation.svg',
    alt: 'Vacation',
  },
  {
    src: '/images/puma.svg',
    alt: 'Puma',
  },
  {
    src: '/images/ag1.svg',
    alt: 'AG1',
  },
  {
    src: '/images/arc.svg',
    alt: 'Arc',
  },
  {
    src: '/images/cards.svg',
    alt: 'Cards',
  },
  {
    src: '/images/vercel.svg',
    alt: 'Vercel',
  },
  {
    src: '/images/sonos.svg',
    alt: 'Sonos',
  },
  {
    src: '/images/baggu.svg',
    alt: 'Baggu',
  },
];

const collaborations = [
  {
    name: 'Kevin Green',
    description:
      'Curabitur iaculis nisl in orci venenatis, et commodo eros malesuada. Suspendisse potenti.',
    artwork: '/images/col1.png',
  },
  {
    name: 'Kevin Green',
    description:
      'Curabitur iaculis nisl in orci venenatis, et commodo eros malesuada. Suspendisse potenti.',
    artwork: '/images/col2.png',
  },
  {
    name: 'Kevin Green',
    description:
      'Curabitur iaculis nisl in orci venenatis, et commodo eros malesuada. Suspendisse potenti.',
    artwork: '/images/col3.png',
  },
  {
    name: 'Kevin Green',
    description:
      'Curabitur iaculis nisl in orci venenatis, et commodo eros malesuada. Suspendisse potenti.',
    artwork: '/images/col4.png',
  },
];
