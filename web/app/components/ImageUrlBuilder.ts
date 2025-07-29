import imageUrlBuilder from "@sanity/image-url"

// Simple config for image URL building (client-side safe)
const config = {
  projectId: import.meta.env.SANITY_PROJECT_ID || 'td94fa9q',
  dataset: import.meta.env.SANITY_DATASET || 'production',
}

const builder = imageUrlBuilder(config)

export default function urlFor(source: any) {
  // Always return the builder, let the calling code handle invalid sources
  return builder.image(source || {}).auto("format").fit("max")
}
