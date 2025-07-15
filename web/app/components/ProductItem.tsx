import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link className="" key={product.id} prefetch="intent" to={variantUrl}>
      {image && (
        <Image
          alt={image.altText || product.title}
          aspectRatio="1/1"
          data={image}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      {/* <h4>{product.title}</h4> */}
      {/* <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small> */}
    </Link>
  );
}

export function GridProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="grid border uppercase border-b items-center border-gray-200 grid-cols-10 gap-0"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="col-span-2 p-2">001</div>
      <div className="w-[40px] col-span-1 h-full bg-white">
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            className="w-full h-full object-contain"
            sizes="(min-width: 45em) 100px"
          />
        )}
      </div>
      <div className="col-span-4 p-2">
        <h4>{product.title}</h4>
      </div>
      <div className="col-span-2 p-2">
        <Money data={product.priceRange.minVariantPrice} />
      </div>
      <div className="col-span-1 flex items-end justify-end h-full">
        <button className="uppercase bg-black text-white p-2 w-full h-full">
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
