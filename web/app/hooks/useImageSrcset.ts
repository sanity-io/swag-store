import { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder"
import { FitMode } from "@sanity/image-url/lib/types/types"
import React from "react"
import { getImageDimensions, getExtension } from "@sanity/asset-utils"
import { SanityImageAsset } from "~/lib/commonTypes"

const DEFAULT_FIT = "clip"
const DEFAULT_MAX_WIDTH = 800
const DEFAULT_WIDTHS = [320, 480, 640, 720, 800, 1440]

export default function useImageSrcset({
  image,
  widths = DEFAULT_WIDTHS,
  UrlBuilder,
  fit = DEFAULT_FIT,
  ...props
}: {
  image: SanityImageAsset
  UrlBuilder: (image: SanityImageAsset) => ImageUrlBuilder
  aspectRatio?: number
  sizes?: string
  width?: number
  maxWidth?: number
  widths?: number[]
  fit?: FitMode
  saturation?: number
}):
  | {
      defaultSrc: string
      srcSet?: string
      aspectRatio: number | null
      sizes: string
      containerRef: React.MutableRefObject<HTMLDivElement>
      height?: number
      sourceWidth?: number
      extension?: string
    }
  | undefined {
  const containerRef: React.MutableRefObject<HTMLDivElement | undefined> =
    React.useRef()

  if (!image?.asset) {
    return
  }

  try {
    // @TODO: at the moment, getImageDimensions returns the original image's dimensions & aspect ratio, without considering the cropping provided.
    // Once https://github.com/sanity-io/asset-utils/issues/1 gets sorted out, conduct appropriate fixes here
    const { width: sourceWidth, aspectRatio: sourceAspect } =
      getImageDimensions(image as any) || {}
    const extension = getExtension(image as any)
    const aspectRatio = props.aspectRatio || sourceAspect

    const height =
      aspectRatio && props.width
        ? Math.round(props.width / aspectRatio)
        : undefined

    // We can either set a custom `sizes` property or consider the maximum size of containers.
    // We're not going to have fullscreen images, so
    // the maximum size they'll have is that of the
    // container, unless specified otherwise
    const maxWidth = props.maxWidth || DEFAULT_MAX_WIDTH
    const sizes = containerRef?.current
      ? `${containerRef.current.clientWidth}px`
      : props.sizes || `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`

    // When we pass widths to <Image /> we're thinking about their px size on screen, but their actual size depends on the DPI of the user's device
    // Here we're adding 3 variations for each width - 1x, 2x and 3x - which the browser will use to choose which one is the most suitable for the user's screen
    let widthsWithRetina = Array.from(
      // The set will de-duplicate widths
      new Set(
        widths.reduce(
          (all, sourceW) => [...all, sourceW, sourceW * 2, sourceW * 3],
          []
        )
      )
    )
      // finish by sorting them for a tidy srcset
      .sort((a, b) => a - b)
      .filter(
        (sourceW) =>
          // Remove widths that are bigger than the original width of the image
          (sourceWidth ? sourceW < sourceWidth : true) &&
          // And widths that are bigger than the desired maxWidth
          (props.maxWidth ? sourceW < props.maxWidth * 3 : true)
      )
    const largestWidth = widthsWithRetina.slice(-1)[0]
    // If the largestWidth is smaller than the source image's width, add that as the last image width
    if (sourceWidth - largestWidth > 0) {
      widthsWithRetina = [...widthsWithRetina, sourceWidth]
    }

    const imgVariations = widthsWithRetina.map((widthEntry) => {
      const base = UrlBuilder(image)
        .width(widthEntry)
        .fit(fit)
        .saturation(props.saturation)

      return {
        builder: aspectRatio
          ? base.height(Math.round(widthEntry / aspectRatio))
          : base,
        width: widthEntry,
      }
    })

    // We don't need variations of an SVG as the Sanity image pipeline will serve the same image no matter the `w` param we add to the final URL
    const srcSet =
      extension !== "svg"
        ? imgVariations
            .map(
              (variation) => `${variation.builder.url()} ${variation.width}w`
            )
            .join(",")
        : undefined

    const defaultWidth = props.width || Math.min(DEFAULT_MAX_WIDTH, sourceWidth)
    const defaultSrcBuilder = aspectRatio
      ? UrlBuilder(image).height(Math.round(defaultWidth / aspectRatio))
      : UrlBuilder(image)
    const defaultSrc =
      extension === "svg"
        ? // There's no need to pass any query param to SVG images, we want the raw version of them
          defaultSrcBuilder.url()
        : defaultSrcBuilder.width(defaultWidth).fit(fit).url()

    return {
      defaultSrc,
      srcSet,
      aspectRatio,
      sizes,
      height,
      containerRef,
      sourceWidth,
      extension,
    }
  } catch (error) {
    console.log('error', error);
    return
  }
}
