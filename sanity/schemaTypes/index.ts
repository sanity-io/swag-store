import {accordionGroupType} from './objects/module/accordionGroupType'
import {accordionType} from './objects/module/accordionType'
import {calloutType} from './objects/module/calloutType'
import {callToActionType} from './objects/module/callToActionType'
import {collectionGroupType} from './objects/collection/collectionGroupType'
import {collectionLinksType} from './objects/collection/collectionLinksType'
import {collectionReferenceType} from './objects/module/collectionReferenceType'
import {collectionRuleType} from './objects/shopify/collectionRuleType'
import {customProductOptionColorObjectType} from './objects/customProductOption/customProductOptionColorObjectType'
import {customProductOptionColorType} from './objects/customProductOption/customProductOptionColorType'
import {customProductOptionSizeObjectType} from './objects/customProductOption/customProductOptionSizeObjectType'
import {customProductOptionSizeType} from './objects/customProductOption/customProductOptionSizeType'
import {footerType} from './objects/global/footerType'
import {gridItemType} from './objects/module/gridItemType'
import {gridType} from './objects/module/gridType'
import {heroType} from './objects/module/heroType'
import {imageCallToActionType} from './objects/module/imageCallToActionType'
import {imageFeaturesType} from './objects/module/imageFeaturesType'
import {imageFeatureType} from './objects/module/imageFeatureType'
import {imageWithProductHotspotsType} from './objects/hotspot/imageWithProductHotspotsType'
import {instagramType} from './objects/module/instagramType'
import {inventoryType} from './objects/shopify/inventoryType'
import {linkEmailType} from './objects/link/linkEmailType'
import {linkExternalType} from './objects/link/linkExternalType'
import {linkInternalType} from './objects/link/linkInternalType'
import {linkProductType} from './objects/link/linkProductType'
import {menuLinksType} from './objects/global/menuLinksType'
import {menuType} from './objects/global/menuType'
import {notFoundPageType} from './objects/global/notFoundPageType'
import {optionType} from './objects/shopify/optionType'
import {placeholderStringType} from './objects/shopify/placeholderStringType'
import {priceRangeType} from './objects/shopify/priceRangeType'
import {productFeaturesType} from './objects/module/productFeaturesType'
import {productHotspotsType} from './objects/hotspot/productHotspotsType'
import {productReferenceType} from './objects/module/productReferenceType'
import {productWithVariantType} from './objects/shopify/productWithVariantType'
import {proxyStringType} from './objects/shopify/proxyStringType'
import {seoType} from './objects/seoType'
import {shopifyCollectionType} from './objects/shopify/shopifyCollectionType'
import {shopifyProductType} from './objects/shopify/shopifyProductType'
import {shopifyProductVariantType} from './objects/shopify/shopifyProductVariantType'
import {spotType} from './objects/hotspot/spotType'

import {informationHeroType} from './objects/module/informationHero'
import {logoGridType} from './objects/module/logoGrid'
import {techInformationType} from './objects/module/techInformation'
import {collaboratorsType} from './objects/module/collaborators'
import {faqsType} from './objects/module/faqs'
import {careersType} from './objects/module/careersType'
import customTable from './objects/module/customTable'
import {specialGridItemType} from './objects/module/specialGridItem'

// Objects used as annotations must be imported first
const annotations = [linkEmailType, linkExternalType, linkInternalType, linkProductType]

const objects = [
  accordionGroupType,
  accordionType,
  calloutType,
  callToActionType,
  collectionGroupType,
  collectionLinksType,
  collectionReferenceType,
  collectionRuleType,
  customProductOptionColorObjectType,
  customProductOptionColorType,
  customProductOptionSizeObjectType,
  customProductOptionSizeType,
  informationHeroType,
  logoGridType,
  techInformationType,
  collaboratorsType,
  faqsType,
  careersType,
  customTable,
  footerType,
  gridItemType,
  gridType,
  specialGridItemType,
  heroType,
  imageCallToActionType,
  imageFeaturesType,
  imageFeatureType,
  imageWithProductHotspotsType,
  instagramType,
  inventoryType,
  menuLinksType,
  menuType,
  notFoundPageType,
  optionType,
  placeholderStringType,
  priceRangeType,
  productFeaturesType,
  productHotspotsType,
  productReferenceType,
  productWithVariantType,
  proxyStringType,
  seoType,
  shopifyCollectionType,
  shopifyProductType,
  shopifyProductVariantType,
  spotType,
]

import {portableTextType} from './portableText/portableTextType'
import {portableTextSimpleType} from './portableText/portableTextSimpleType'

const blocks = [portableTextType, portableTextSimpleType]

import {collectionType} from './documents/collection'
import {colorThemeType} from './documents/colorTheme'
import {pageType} from './documents/page'
import {homeType} from './documents/home'
import {colorVariantType} from './documents/colorVariant'
import {productMapType} from './documents/productMap'
import {productType} from './documents/product'
import {productVariantType} from './documents/productVariant'
import {categoryType} from './documents/category'
import {postType} from './documents/post'
import {marketingCampaignType} from './documents/marketingCampaign'
import {notification} from './documents/notification'
import {customerType} from './documents/customer'

const documents = [collectionType, colorThemeType, pageType, categoryType, homeType, productType, colorVariantType, productMapType, productVariantType, postType, marketingCampaignType, notification, customerType]

import {settingsType} from './singletons/settingsType'

const singletons = [settingsType]

export const schemaTypes = [...annotations, ...objects, ...singletons, ...blocks, ...documents]
