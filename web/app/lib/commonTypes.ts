export type SanityBlockContent = any[]

export interface SanitySlug {
  _type?: "slug"
  current?: string
}

export interface SanityReference {
  _type: "reference"
  _ref: string
}

export interface SanityImageAsset {
  alt?: string
  caption?: string
  crop?: {
    bottom: number
    left: number
    right: number
    top: number
  }
  hotspot?: {
    height: number
    width: number
    x: number
    y: number
  }
  asset?: {
    _id?: string
    _ref?: string
    _type?: string
    altText?: string
    url?: string
    metadata?: {
      lqip?: `data:image/${string}`
      dimensions?: {
        height?: number
        width?: number
      }
    }
  }
}

export interface BaseSanityDoc {
  _id: string
  _createdAt: string
  _updatedAt: string
  _rev: string
  _type: string
}
