import {Image, Money} from '@shopify/hydrogen';
import {LocalizedLink} from './LocalizedLink';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {ProductForm, ProductVariantForm} from './ProductForm';

export function ProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <div className="relative group" key={product.id}>
      <LocalizedLink to={variantUrl} className="product-item">
        {image && (
          <Image
            alt={image.altText ?? ''}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}
      </LocalizedLink>
      <div className="absolute bottom-0 opacity-0 z-10 800:group-hover:opacity-100 transition-opacity duration-300 p-2 text-center w-full left-0 right-0 ">
        <ProductVariantForm
          productOptions={product.options}
          selectedVariant={product.selectedOrFirstAvailableVariant}
          category={product.tags[0]}
        />
      </div>
    </div>
  );
}

export function GridProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <div
      className="grid border md:hover:bg-[rgba(0,0,0,0.03)] relative uppercase border-b items-center border-gray-200 grid-cols-10 gap-0"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <LocalizedLink
        to={variantUrl}
        className=" absolute top-0 left-0 items-center justify-center w-full h-full"
      ></LocalizedLink>
      <div className="hidden 800:block col-span-2 p-1.5">001</div>
      <div className="w-[36px] col-span-1 h-full bg-white">
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
      <div className="col-span-6 800:col-span-3 p-1.5">
        <h4>{product.title}</h4>
      </div>
      <div className="col-span-2 p-1.5">
        <Money data={product.priceRange.minVariantPrice} />
      </div>
      <div className="col-span-1 relative z-10 800:col-span-2 flex  justify-end h-full">
        <LocalizedLink
          to={variantUrl}
          className="bg-black 800:hidden flex items-center justify-center w-full h-full"
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Navigate to {product.title}</title>
            <g clip-path="url(#clip0_419_3357)">
              <path
                d="M5.75 17.25L17.25 5.75"
                stroke="white"
                stroke-width="2.15625"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.90625 5.75H17.25V15.0938"
                stroke="white"
                strokeWidth="2.15625"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_419_3357">
                <rect width="23" height="23" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </LocalizedLink>
        <div className="hidden 800:block">
          <ProductVariantForm
            productOptions={product.options}
            selectedVariant={product.selectedOrFirstAvailableVariant}
            category={product.category?.slug.current}
          />
        </div>
      </div>
    </div>
  );
}
