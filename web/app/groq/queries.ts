import groq from 'groq';

export const NESTED_PRODUCT_QUERY = groq`
  'products': coalesce(modules[] {
    (_type == 'grid') => {
      'product': coalesce(items[] {
        (_type == 'productReference') => {
        'productId': productWithVariant.product->store.gid
        }
      }, [])[defined(productId)]
    }
  })
`;

export const NESTED_HOME_PRODUCTS_QUERY = groq`*[_type == "settings"][0].homePage-> {
  ${NESTED_PRODUCT_QUERY}
}`;

const PRODUCT_REFERENCE_QUERY = groq`
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
`;

const COLLABORATORS_QUERY = groq`
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
`;

const INFORMATION_HERO_QUERY = groq`
  (_type == 'informationHero') => {
    subtitle,
    header,
    content,
  }
`;

export const HOME_PAGE_QUERY = groq`*[_type == "settings"][0].homePage-> {
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
          }
        }
      }
    }
}`;

export const PAGE_QUERY = groq`*[_type in ["page"] && slug.current == $handle][0] {
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
  }
}`;