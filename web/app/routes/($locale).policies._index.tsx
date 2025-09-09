import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {LocalizedLink} from '~/components/LocalizedLink';

export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(POLICIES_QUERY, {
    variables: {
      country: context.storefront.i18n?.country,
      language: context.storefront.i18n?.language,
    },
  });
  const policies = Object.values(data.shop || {});

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div className="policies">
      <h1>Policies</h1>
      <div>
        {policies.map((policy) => {
          if (!policy) return null;
          return (
            <fieldset key={policy.id}>
              <LocalizedLink to={`/policies/${policy.handle}`}>
                {policy.title}
              </LocalizedLink>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
