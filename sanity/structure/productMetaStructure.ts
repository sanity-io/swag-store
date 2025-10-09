import {ListItemBuilder} from 'sanity/structure'
import defineStructure from '../utils/defineStructure'

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title('Product Meta')
    .icon(() => '🔔')
    .schemaType('productMeta')
    .child(
      S.documentTypeList('productMeta')
        .title('All Product Meta')
        .defaultOrdering([{field: 'createdAt', direction: 'desc'}])
        .child((documentId) => S.document().documentId(documentId).schemaType('productMeta')),
    ),
)
