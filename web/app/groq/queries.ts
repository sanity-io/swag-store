import { defineQuery } from 'groq';

export const NESTED_PRODUCT_QUERY = defineQuery(`
  'products': coalesce(modules[] {
    (_type == 'grid') => {
      'product': coalesce(items[] {
        (_type == 'productReference') => {
        'productId': productWithVariant.product->store.gid
        }
      }, [])[defined(productId)]
    }
  })
`);  

export const NESTED_HOME_PRODUCTS_QUERY = defineQuery(`*[_type == "settings"][0].homePage-> {
  ${NESTED_PRODUCT_QUERY}
}`);

const PRODUCT_REFERENCE_QUERY = defineQuery(`
  (_type == 'productReference') => {     
    productWithVariant {
      ...,
      product-> {
        ...,
        category-> {
          _key,
          title,
          slug,
        }
      },
      'backgroundColor': colorTheme->background.hex,
    }
  }
`);

const COLLABORATORS_QUERY = defineQuery(`
  (_type == 'collaborators') => {
    subtitle,
    items[] {
      _type,
      _key,
      image {
        asset-> {
          ...,
        }
      },
      name,
      description,
      url,
    }
  }
`);

const LOGOS_QUERY = defineQuery(`
  (_type == 'logoGrid') => {
    title,
    items[] {
      _key,
      image {
        asset-> {
          ...,
        }
      },
      url,
      title,
    }
  }
`);

const CAREERS_QUERY = defineQuery(`
  (_type == 'careers') => {
    subtitle,
    body,
    cta,
  }
`);

const INFORMATION_HERO_QUERY = defineQuery(`
  (_type == 'informationHero') => {
    subtitle,
    header,
    content,
  }
`);

const TECH_INFORMATION_QUERY = defineQuery(`

  (_type == 'techInformation') => {
       subtitle,
    description,
    infoBlocks[] {
      _key,
      content,
      image {
        asset-> {
          ...,
        }
      },
    },
  }
`);

const FAQS_QUERY = defineQuery(`
  (_type == 'faqs') => {
    subtitle,
    description,
    questions[] {
      _key,
      question,
      answer,
    }
  }
`);

export const PRODUCT_AGE_ANALYSIS_QUERY = defineQuery(`
  productAgeAnalysis[] {
    _key,
    product-> {
      _id,
      title,
      store {
        title,
        gid
      }
    },
    lastUpdated,
    createdAt,
    ageInDays,
    updatedAgeInDays,
    isOld
  }
`);

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "settings"][0].homePage-> {
    modules[] {
      _type,
      _key,
      ...,
      (_type == 'grid') => {
        items[] {
          _type,
          _key,
          ...,
          ${PRODUCT_REFERENCE_QUERY},
          (_type == 'gridItem') => {
            ...
          },
          (_type == 'specialGridItem') => {
            ...,
            'backgroundColor': colorTheme->background.hex,
          }
        }
      }
    },
    ${PRODUCT_AGE_ANALYSIS_QUERY}
}`);

export const PAGE_QUERY = defineQuery(`*[_type in ["page"] && slug.current == $handle][0] {
  title,
  _type,
  'slug': slug.current,
  svgSupport {
    asset-> {
      shopifyUrl,
      metadata
    }
  },
  'seo': seo {
    title,
    description,
    image {
      asset-> {
        shopifyUrl,
        metadata
      }
    }
  },
  modules[] {
    _type,
    _key,
    ${COLLABORATORS_QUERY},
    ${INFORMATION_HERO_QUERY},
    ${TECH_INFORMATION_QUERY},
    ${LOGOS_QUERY},
    ${FAQS_QUERY},
    ${CAREERS_QUERY},
  }
}`);

export const SANITY_PRODUCT_QUERY = defineQuery(`*[_type == "product" && slug == $handle][0] {
  ...,
  images[] {
    ...,
    asset->{
      ...,
      url,
    },
    alt,
  },
  category->
}`);