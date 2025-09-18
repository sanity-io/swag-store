import type {FilterDefault} from '@sanity/client';

export const filter: FilterDefault = (props) => {
  return props.filterDefault(props);
};
