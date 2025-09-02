import {DocumentIcon} from '@sanity/icons'
import {ListItemBuilder} from 'sanity/structure';
import defineStructure from '../utils/defineStructure'
import {PostPreviewPane} from '../components/PostPreviewPane'

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title('Emails')
    .icon(DocumentIcon)
    .schemaType('post')
    .child(
      S.documentTypeList('post')
        .title('All Emails')
        .child((documentId) =>
          S.document()
            .documentId(documentId)
            .schemaType('post')
            .views([
              S.view.form().title('Form'),
              S.view
                .component(PostPreviewPane)
                .title('Preview')
                .options({
                  document: {_id: documentId}
                })
            ])
        )
    )
)
