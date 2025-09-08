import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {useInView} from 'react-intersection-observer';
import ImageUrlBuilder from '~/components/ImageUrlBuilder';
import useImageSrcset from '~/hooks/useImageSrcset';
import {SanityImageAsset} from '~/lib/commonTypes';

/**
 * @param {object} props
 * @param {object} [props.image]
 * @param {string} [props.className]
 * @param {string} [props.alt]
 * @param {number} [props.aspect]
 * @param {string} [props.src]
 * @param {string} [props.fit]
 * @param {string} [props.srcSet]
 * @param {string} [props.sizes]
 * @param {number} [props.maxWidth]
 * @param {number} [props.width]
 * @param {"auto"|"lazy"|"eager"} [props.loading]
 * @param {number[]} [props.widths]
 * @param {boolean} [props.loadingPlaceholder]
 */
function Image({
  image,
  alt,
  src: singleSrc,
  aspect: targetAspect,
  srcSet: initialSrcSet,
  maxWidth,
  width,
  fit,
  sizes: initialSizes,
  widths,
  loading = 'lazy',
  saturation,
  className,
  containerClasses,
  loadingPlaceholder = true,
  ...unknownProps
}: {
  image: SanityImageAsset;
  alt: string;
  src: string;
  aspect: number;
  srcSet: string;
  maxWidth: number;
  width?: number;
  fit?: string;
  initialSizes?: string;
  widths?: number[];
  loading?: string;
  saturation?: number;
  className?: string;
  containerClasses?: string;
  loadingPlaceholder?: boolean;
  sizes?: string;
}) {
  const [inViewRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: `200px 0px`,
  });
  const [isLoaded, setLoaded] = useState(0);

  // When an image is in the browser cache or is completed loading before react rehydration,
  // the `onload` may not be triggered. In order to ensure we have the correct "complete"
  // state, check the `complete` property after mounting
  const imgRef = React.createRef();
  useEffect(() => {
    if (
      imgRef &&
      imgRef.current &&
      imgRef.current?.complete &&
      imgRef.current?.naturalWidth
    ) {
      setLoaded(true);
    }
  });

  const UrlBuilder = ImageUrlBuilder;
  const imageData =
    useImageSrcset({
      image,
      aspectRatio: targetAspect,
      fit,
      sizes: initialSizes,
      widths,
      width,
      maxWidth,
      saturation,
      UrlBuilder,
    }) || {};
  const {
    aspectRatio,
    sizes,
    height,
    srcSet,
    defaultSrc,
    containerRef,
    sourceWidth,
    extension,
  } = imageData;

  const src = singleSrc || defaultSrc;

  if (!src) {
    return null;
  }

  const commonImageProps = {
    src,
    alt: alt || image?.alt || image?.caption || ' ',
    loading,
    width,
    height,
  };

  // If loading is eager, there's no need to wait for it to be inView
  const showImage = loading === 'eager' || inView;
  const containerClass =
    'relative overflow-hidden w-full' + ' ' + containerClasses;

  const bg = image?.asset?.metadata?.palette?.dominant?.background;
  const lqip = image?.asset?.metadata?.lqip;

  return (
    <div
      ref={inViewRef}
      className={containerClass}
      data-has-aspect={!!aspectRatio}
      // Used to limit a rasterized image's width to its maximum source width
      style={{
        '--aspect-ratio': aspectRatio ? aspectRatio : undefined,
        '--source-width':
          extension !== 'svg' && typeof sourceWidth === 'number'
            ? `${sourceWidth}px`
            : undefined,
        // For smaller placements of images, it's okay if they're stretched by a bit
        maxWidth:
          extension !== 'svg' &&
          typeof sourceWidth === 'number' &&
          (maxWidth || width) > 400
            ? 'var(--source-width)'
            : undefined,
      }}
    >
      <div
        ref={containerRef}
        className={`absolute top-0 left-0 w-full h-full ${
          isLoaded ? 'opacity-0 h-auto' : ' bg-gray'
        }`}
        // If we have no bg color, no lqip and loadingPlaceholder === true, then show a loading placeholder
        data-show-placeholder={!bg && !lqip && loadingPlaceholder}
        data-is-loaded={isLoaded}
        aria-hidden="true"
        style={{
          backgroundColor: bg,
          backgroundImage: lqip && `url(${lqip})`,
          paddingBottom: aspectRatio ? `${100 / aspectRatio}%` : undefined,
          boxSizing: 'border-box',
          height: '100%',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {showImage ? (
        <picture>
          {/* If we have a singleSrc defined, such as in FourOhFour, that means we don't need image variations, so these sources are unnecessary */}
          {!singleSrc && (srcSet || initialSrcSet) && (
            <source srcSet={srcSet || initialSrcSet} sizes={sizes} />
          )}
          <img
            {...unknownProps}
            {...commonImageProps}
            sizes={sizes}
            onLoad={() => setLoaded(true)}
            className="w-full h-auto object-cover"
            style={{opacity: isLoaded ? 1 : 0}}
            ref={imgRef}
          />
        </picture>
      ) : null}
      <noscript>
        <img
          {...unknownProps}
          {...commonImageProps}
          srcSet={srcSet || initialSrcSet}
          sizes={sizes}
        />
      </noscript>
    </div>
  );
}

export default Image;
