import {LocalizedLink} from './LocalizedLink';
import {Image} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  ProductWithVariantFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {PortableText} from '@portabletext/react';
import {useLoaderData} from 'react-router';
import {ProductVariantForm} from './ProductForm';
import {portableRichText} from '~/serializers/richText';
import {PortableTextSimple} from 'sanity.generated';
import {useDebug} from '~/contexts/DebugContext';
import clsx from 'clsx';

interface GridProps {
  items: Array<{
    _key: string;
    _type: string;
    productWithVariant?: ProductWithVariantFragment;
    backgroundColor?: string;
    cta?: {
      text: string;
      color?: string;
    };
    trigger?: string;
    body?: PortableTextSimple;
  }>;
  loading?: 'eager' | 'lazy';
}

export function Grid({items, loading = 'lazy'}: GridProps) {
  if (!items?.length) return null;
  const data = useLoaderData<typeof loader>();
  const {toggleComments, commentsEnabled} = useDebug();
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
        if (item?._type === 'specialGridItem') {
          return (
            <div
              className="w-full h-full grid-item flex items-center justify-center p-2 py-0 px-4"
              style={{backgroundColor: item.backgroundColor || 'black'}}
            >
              <button
                key={item._key}
                onClick={() => {
                  if (item.trigger === 'comments') {
                    toggleComments();
                  }
                }}
                className={clsx(
                  'px-8 py-2 uppercase rounded-[40px] cursor-pointer',
                  {
                    'bg-brand-orange text-black h-[56px] md:hover:bg-brand-orange/80 md:text-white':
                      item.cta?.color === 'orange',
                  },
                )}
              >
                {item.trigger === 'comments' ? (
                  !commentsEnabled ? (
                    <h4>{item.cta?.text}</h4>
                  ) : (
                    <>Disable Debug</>
                  )
                ) : (
                  <h4>{item.cta?.text}</h4>
                )}
              </button>
            </div>
          );
        }
        if (item?._type === 'gridItem') {
          return (
            <div
              key={item._key}
              className="grid-item text-white p-2 py-0 px-4"
              style={{backgroundColor: 'black'}}
            >
              {item.body && (
                <PortableText value={item.body} components={portableRichText} />
              )}
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
  const {commentsEnabled} = useDebug();
  const variantUrl = useVariantUrl(
    product.store?.slug.current || product.handle,
  );
  const image = product.featuredImage;
  return (
    <div
      className="relative group grid-item w-full"
      style={{backgroundColor: backgroundColor}}
    >
      <LocalizedLink
        className="grid-item relative"
        prefetch="intent"
        to={variantUrl}
      >
        {product.store?.previewImageUrl && (
          <Image
            alt={product.store?.title || product.title}
            aspectRatio="1/1"
            src={product.store?.previewImageUrl}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}
      </LocalizedLink>
      <div className="absolute bottom-0 opacity-0 800:group-hover:opacity-100 transition-opacity duration-300 p-2 text-center w-full left-0 right-0 z-10">
        {shopifyProduct && (
          <ProductVariantForm
            productOptions={shopifyProduct.options}
            selectedVariant={shopifyProduct.selectedOrFirstAvailableVariant}
            category={product.category?.slug.current}
          />
        )}
      </div>
      {commentsEnabled && (
        <div className="absolute top-0 left-0 w-full p-2 z-10">
          <div className="bg-black/80 glass-dark text-white border border-white p-4  mb-4">
            <h3 className="font-bold mb-2">Product Card Debug Info:</h3>
            <div className="text-sm">
              <p>
                <strong>GID:</strong> {shopifyProduct?.id ?? 0}
              </p>
              <p>
                <strong>Category:</strong>{' '}
                {product.category?.slug.current ?? ''}
              </p>
              <p>
                <strong>Handle:</strong> {variantUrl ?? ''}
              </p>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold">
                Raw Data
              </summary>
              <pre className="mt-2 text-xs bg-black p-2 rounded overflow-auto max-h-40">
                Sanity Product:
                <br />
                {JSON.stringify(product, null, 2)}
                <br />
                Shopify Product:
                <br />
                {JSON.stringify(shopifyProduct, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
