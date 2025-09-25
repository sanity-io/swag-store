import {ListItemBuilder} from 'sanity/structure';
import {HomeIcon} from '@sanity/icons'
import defineStructure from '../utils/defineStructure'

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title('Home Pages')
    .icon(HomeIcon)
    .schemaType('home')
    .child(S.documentTypeList('home'))
)
