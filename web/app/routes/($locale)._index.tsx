import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction, useLocation} from 'react-router';
import {useEffect} from 'react';

import PageComponentList from '~/components/PageComponentList';
import {ProductAgeAnalysis} from '~/components/ProductAgeAnalysis';

import {HOME_PAGE_QUERY, NESTED_HOME_PRODUCTS_QUERY} from '~/groq/queries';

import {SANITY_SHOPIFY_PRODUCTS} from '~/graphql/ProductQuery';

import {Query} from 'hydrogen-sanity';

export const meta: MetaFunction = (data) => {
  return [
    {title: 'Sanity Market'},

    {
      name: 'description',
      content: 'Content Operations for your Body. ',
    },
    {
      property: 'og:image',
      content:
        'https://cdn.sanity.io/images/l3u4li5b/production/2942779cef7268f6cad8e55e44dd233eeb0a26b6-1200x630.png',
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    {
      property: 'og:image:alt',
      content: 'Content Operations for your Body. ',
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  // Run both Sanity queries in parallel for better performance
  const [data, productData] = await Promise.all([
    context.sanity.query(HOME_PAGE_QUERY),
    context.sanity.query(NESTED_HOME_PRODUCTS_QUERY),
  ]);

  const products = context.sanity.preview?.enabled
    ? productData.data?.products
    : productData.products;
  if (!products) {
    throw new Response(
      '<div class="text-red-500">Product data not found or missing a homepage configuration in the <a class="underline" href="http://localhost:3000/structure/settings">sanity studio settings configuration</a>.</div>',
      {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'text/html',
        },
      },
    );
  }

  const productIds = products
    ?.map(({product}: any) => product.map((p: any) => p.productId))
    .flat();
  const uniqueProductIds = [...new Set(productIds)];

  let deferredData = {};
  if (uniqueProductIds.length > 0) {
    deferredData = await context.storefront.query(SANITY_SHOPIFY_PRODUCTS, {
      variables: {
        ids: uniqueProductIds,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    });
  }

  return {
    sanityData: data,
    productData: deferredData,
  };
}

export default function Home() {
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
    <div className="home bg-gray-100">
      <Query query={HOME_PAGE_QUERY} options={{initial: data.sanityData}}>
        {(data) => (
          <div>
            <PageComponentList components={data?.modules} />
            <ProductAgeAnalysis productAgeAnalysis={data?.productAgeAnalysis} />
          </div>
        )}
      </Query>
    </div>
  );
}
