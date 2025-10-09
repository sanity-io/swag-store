import {defineField, defineType} from 'sanity';

export const attributionUtmParamType = defineType({
  name: 'attributionUtmParam',
  title: 'UTM Parameter',
  type: 'object',
  fields: [
    defineField({
      name: 'key',
      title: 'Key',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
});
