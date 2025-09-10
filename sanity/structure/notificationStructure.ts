import {ListItemBuilder} from 'sanity/structure'
import defineStructure from '../utils/defineStructure'

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title('Notifications')
    .icon(() => '🔔')
    .schemaType('notification')
    .child(
      S.documentTypeList('notification')
        .title('All Notifications')
        .defaultOrdering([{field: 'createdAt', direction: 'desc'}])
        .child((documentId) =>
          S.document()
            .documentId(documentId)
            .schemaType('notification')
        )
    )
)
