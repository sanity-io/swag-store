import {EnvelopeIcon, LaunchIcon} from '@sanity/icons'
import {ListItemBuilder} from 'sanity/structure';
import defineStructure from '../utils/defineStructure'
import {PostPreviewPane} from '../components/PostPreviewPane'

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title('Emails')
    .icon(EnvelopeIcon)
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

export const marketingCampaigns = defineStructure<ListItemBuilder>((S) =>
  S.listItem()
.title('Marketing Campaigns')
.icon(LaunchIcon)
.schemaType('post')
.child(
  S.documentTypeList('marketingCampaign')
    .title('All Marketing Campaigns')
    .child((documentId) =>
      S.document()
        .documentId(documentId)
        .schemaType('marketingCampaign')
    )
)
)