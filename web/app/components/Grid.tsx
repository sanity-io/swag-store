import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  ProductWithVariantFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

interface GridProps {
  items: Array<{
    _key: string;
    _type: string;
    productWithVariant?: ProductWithVariantFragment;
  }>;
  loading?: 'eager' | 'lazy';
}

export function Grid({items, loading = 'lazy'}: GridProps) {
  console.log('items', items);
  if (!items?.length) return null;

  return (
    <div className="grid grid-cols-1 800:grid-cols-2 gap-0">
      {items.map((item) => {
        if (item?._type === 'productReference') {
          return (
            <GridItem
              key={item._key}
              product={item?.productWithVariant?.product || {}}
              loading={loading}
            />
          );
        }
        if (item?._type === 'gridItem') {
          return <div key={item._key}>HEY</div>;
        }
        return null;
      })}
    </div>
  );
}

function GridItem({
  product,
  loading,
}: {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(
    product.store?.slug.current || product.handle,
  );
  const image = product.featuredImage;

  return (
    <Link className="grid-item" prefetch="intent" to={variantUrl}>
      {product.store?.previewImageUrl && (
        <Image
          alt={product.store?.title || product.title}
          aspectRatio="1/1"
          src={product.store?.previewImageUrl}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4>{product.store?.title || product.title}</h4>
    </Link>
  );
}
