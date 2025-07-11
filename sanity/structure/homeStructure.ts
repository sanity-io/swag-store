import {ListItemBuilder} from 'sanity/structure';
import defineStructure from '../utils/defineStructure'

export default defineStructure<ListItemBuilder>((S) =>
  S.listItem()
    .title('Home Pages')
    .schemaType('home')
    .child(S.documentTypeList('home'))
)
