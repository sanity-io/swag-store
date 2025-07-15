import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  ProductWithVariantFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {PortableText} from '@portabletext/react';
import {useLoaderData} from 'react-router';
import {ProductForm} from './ProductForm';

interface GridProps {
  items: Array<{
    _key: string;
    _type: string;
    productWithVariant?: ProductWithVariantFragment;
  }>;
  loading?: 'eager' | 'lazy';
}

export function Grid({items, loading = 'lazy'}: GridProps) {
  if (!items?.length) return null;
  const data = useLoaderData<typeof loader>();
  return (
    <div className="grid grid-cols-1 800:grid-cols-2 gap-0">
      {items.map((item) => {
        if (item?._type === 'productReference') {
          const matchedProduct = data.productData.nodes.find(
            (product) =>
              product.id === item?.productWithVariant?.product?.store.gid,
          );
          return (
            <GridItem
              key={item._key}
              product={item?.productWithVariant?.product || {}}
              shopifyProduct={matchedProduct}
              backgroundColor={item?.productWithVariant?.backgroundColor || ''}
              loading={loading}
            />
          );
        }
        if (item?._type === 'gridItem') {
          return (
            <div
              key={item._key}
              className="bg-black aspect-square p-4 text-white"
            >
              <PortableText value={item.body} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function GridItem({
  product,
  backgroundColor,
  loading,
  shopifyProduct,
}: {
  product: ProductItemFragment;
  backgroundColor: string;
  loading?: 'eager' | 'lazy';
  shopifyProduct: ProductItemFragment;
}) {
  const variantUrl = useVariantUrl(
    product.store?.slug.current || product.handle,
  );
  const image = product.featuredImage;
  return (
    <div
      className="relative group grid-item w-full"
      style={{backgroundColor: backgroundColor}}
    >
      <Link className="grid-item relative" prefetch="intent" to={variantUrl}>
        {product.store?.previewImageUrl && (
          <Image
            alt={product.store?.title || product.title}
            aspectRatio="1/1"
            src={product.store?.previewImageUrl}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}

        {/* <h4>{product.store?.title || product.title}</h4> */}
      </Link>
      <div className="absolute bottom-0 opacity-0 800:group-hover:opacity-100 transition-opacity duration-300 p-2 text-center w-full left-0 right-0 z-10">
        {shopifyProduct && (
          <ProductForm
            productOptions={shopifyProduct.options}
            selectedVariant={shopifyProduct.selectedOrFirstAvailableVariant}
            category={product.category?.slug.current}
          />
        )}
      </div>
    </div>
  );
}
