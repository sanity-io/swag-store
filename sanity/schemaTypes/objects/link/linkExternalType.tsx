import {EarthGlobeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const linkExternalType = defineType({
  title: 'External Link',
  name: 'linkExternal',
  type: 'object',
  icon: EarthGlobeIcon,
  components: {
    annotation: (props) => (
      <span>
        <EarthGlobeIcon
          style={{
            marginLeft: '0.05em',
            marginRight: '0.1em',
            width: '0.75em',
          }}
        />
        {props.renderDefault(props)}
      </span>
    ),
  },
  fields: [
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'External URL to link to',
      validation: (Rule) => [
        Rule.required().error('URL is required for external links'),
        Rule.uri({scheme: ['http', 'https']}).error('URL must start with http:// or https://'),
      ],
    }),
    defineField({
      title: 'Open Behavior',
      name: 'newWindow',
      type: 'string',
      options: {
        list: [
          {title: 'Open in new window', value: 'new'},
          {title: 'Open in same window', value: 'same'},
        ],
        layout: 'radio',
      },
      initialValue: 'new',
      description: 'How the link should open when clicked',
    }),
  ],
})
