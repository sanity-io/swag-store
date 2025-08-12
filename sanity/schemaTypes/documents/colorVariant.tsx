import {defineField, defineType} from 'sanity'

export const colorVariantType = defineType({
  name: 'colorVariant',
  title: 'Color Variant',
  type: 'document',
  fields: [
    defineField({
      name: 'colorName',
      title: 'Color Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'colorValue',
      title: 'Color',
      type: 'color',
      description: 'Pick a solid color',
    }),
    defineField({
      name: 'pattern',
      title: 'Pattern Image',
      type: 'image',
      description: 'Upload a pattern image instead of selecting a solid color',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'colorName',
      media: 'pattern',
      color: 'colorValue',
    },
    prepare({title, media, color}: {title: any; media: any; color: any}) {
      return {
        title,
        media:
          media ||
          (color?.hex
            ? {
                _type: 'color',
                hex: color.hex,
              }
            : null),
      }
    },
  },
})
