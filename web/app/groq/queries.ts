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
          },
          (_type == 'gridItem') => {
            ...
          }
        }
      }
    }
}`;