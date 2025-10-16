// schemas/objects/table.js
import {TableInput} from '../../../components/TableComponent'

export default {
  name: 'customTable',
  title: 'Table',
  type: 'object',
  components: {
    input: TableInput,
  },
  fields: [
    {
      name: 'headers',
      title: 'Headers',
      type: 'array',
      hidden: true, // Hidden because it's managed by the custom component
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'key',
              title: 'Key',
              type: 'string',
            },
            {
              name: 'flagged',
              title: 'Flagged',
              type: 'boolean',
            },
            {
              name: 'alignment',
              title: 'Alignment',
              type: 'string',
              options: {
                list: [
                  {title: 'Left', value: 'left'},
                  {title: 'Center', value: 'center'},
                  {title: 'Right', value: 'right'},
                ],
              },
            },
          ],
        },
      ],
    },
    {
      name: 'rows',
      title: 'Rows',
      type: 'array',
      hidden: true, // Hidden because it's managed by the custom component
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'id',
              title: 'ID',
              type: 'string',
            },
            {
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'value',
                      title: 'Value',
                      type: 'text',
                    },
                    {
                      name: 'bold',
                      title: 'Bold',
                      type: 'boolean',
                    },
                    {
                      name: 'italic',
                      title: 'Italic',
                      type: 'boolean',
                    },
                    {
                      name: 'flagged',
                      title: 'Flagged',
                      type: 'boolean',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      headers: 'headers',
      rows: 'rows',
    },
    prepare({headers, rows}) {
      const colCount = headers?.length || 0
      const rowCount = rows?.length || 0
      return {
        title: `Table: ${colCount} columns × ${rowCount} rows`,
        subtitle:
          colCount === 0
            ? 'Empty table'
            : `${colCount} column${colCount !== 1 ? 's' : ''}, ${rowCount} row${rowCount !== 1 ? 's' : ''}`,
      }
    },
  },
}
