import React, {useCallback, useState, useMemo} from 'react'
import {set, unset} from 'sanity'
import {Stack, Card, Button, Flex, Text, Box, Grid, Select, Dialog} from '@sanity/ui'
import {AddIcon, TrashIcon, EditIcon} from '@sanity/icons'

// Type definitions
interface Cell {
  value: string
  bold: boolean
  italic: boolean
  flagged: boolean
}

interface Header {
  label: string
  key: string
  flagged: boolean
  alignment: 'left' | 'center' | 'right'
}

interface Row {
  id: string
  cells: Cell[]
}

interface TableData {
  headers: Header[]
  rows: Row[]
}

interface CellPosition {
  rowIndex: number
  colIndex: number
}

interface TableInputProps {
  onChange: (value: any) => void
  value?: TableData
  elementProps?: any
}

// Table Input Component
export function TableInput(props: TableInputProps) {
  const {onChange, value = {headers: [], rows: []}, elementProps} = props
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null)
  const [showCellEditor, setShowCellEditor] = useState(false)
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null)

  const tableData = useMemo(() => {
    return value || {headers: [], rows: []}
  }, [value])

  const handleChange = useCallback(
    (newValue: TableData) => {
      onChange(newValue ? set(newValue) : unset())
    },
    [onChange],
  )

  // Add a new column
  const addColumn = useCallback(() => {
    const newHeaders = [
      ...(tableData.headers || []),
      {
        label: `Column ${(tableData.headers?.length || 0) + 1}`,
        key: `col_${Date.now()}`,
        flagged: false,
        alignment: 'left' as const,
      },
    ]

    const newRows = (tableData.rows || []).map((row: Row) => ({
      ...row,
      cells: [
        ...(row.cells || []),
        {
          value: '',
          bold: false,
          italic: false,
          flagged: false,
        },
      ],
    }))

    handleChange({
      ...tableData,
      headers: newHeaders,
      rows: newRows,
    })
  }, [tableData, handleChange])

  // Add a new row
  const addRow = useCallback(() => {
    const columnsCount = tableData.headers?.length || 0
    const newRow = {
      id: `row_${Date.now()}`,
      cells: Array(columnsCount)
        .fill(null)
        .map(() => ({
          value: '',
          bold: false,
          italic: false,
          flagged: false,
        })),
    }

    handleChange({
      ...tableData,
      rows: [...(tableData.rows || []), newRow],
    })
  }, [tableData, handleChange])

  // Delete a column
  const deleteColumn = useCallback(
    (colIndex: number) => {
      const newHeaders = tableData.headers.filter((_: Header, i: number) => i !== colIndex)
      const newRows = tableData.rows.map((row: Row) => ({
        ...row,
        cells: row.cells.filter((_: Cell, i: number) => i !== colIndex),
      }))

      handleChange({
        headers: newHeaders,
        rows: newRows,
      })
    },
    [tableData, handleChange],
  )

  // Delete a row
  const deleteRow = useCallback(
    (rowIndex: number) => {
      const newRows = tableData.rows.filter((_: Row, i: number) => i !== rowIndex)
      handleChange({
        ...tableData,
        rows: newRows,
      })
    },
    [tableData, handleChange],
  )

  // Update header
  const updateHeader = useCallback(
    (colIndex: number, updates: Partial<Header>) => {
      const newHeaders = [...tableData.headers]
      newHeaders[colIndex] = {...newHeaders[colIndex], ...updates}
      handleChange({
        ...tableData,
        headers: newHeaders,
      })
    },
    [tableData, handleChange],
  )

  // Update cell
  const updateCell = useCallback(
    (rowIndex: number, colIndex: number, updates: Partial<Cell>) => {
      const newRows = [...tableData.rows]
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        cells: [...newRows[rowIndex].cells],
      }
      newRows[rowIndex].cells[colIndex] = {
        ...newRows[rowIndex].cells[colIndex],
        ...updates,
      }
      handleChange({
        ...tableData,
        rows: newRows,
      })
    },
    [tableData, handleChange],
  )

  // Toggle column flag
  const toggleColumnFlag = useCallback(
    (colIndex: number) => {
      updateHeader(colIndex, {
        flagged: !tableData.headers[colIndex].flagged,
      })
    },
    [tableData.headers, updateHeader],
  )

  // Toggle cell flag
  const toggleCellFlag = useCallback(
    (rowIndex: number, colIndex: number) => {
      const cell = tableData.rows[rowIndex].cells[colIndex]
      updateCell(rowIndex, colIndex, {
        flagged: !cell.flagged,
      })
    },
    [tableData.rows, updateCell],
  )

  // Open cell editor
  const openCellEditor = useCallback(
    (rowIndex: number, colIndex: number, event?: React.MouseEvent) => {
      event?.stopPropagation()
      setSelectedCell({rowIndex, colIndex})
      setShowCellEditor(true)
    },
    [],
  )

  const closeCellEditor = useCallback(() => {
    setShowCellEditor(false)
    setSelectedCell(null)
  }, [])

  // Start inline editing
  const startInlineEdit = useCallback(
    (rowIndex: number, colIndex: number, event?: React.MouseEvent) => {
      event?.stopPropagation()
      setEditingCell({rowIndex, colIndex})
    },
    [],
  )

  // Stop inline editing
  const stopInlineEdit = useCallback(() => {
    setEditingCell(null)
  }, [])

  // Save inline edit
  const saveInlineEdit = useCallback(
    (rowIndex: number, colIndex: number, newValue: string) => {
      updateCell(rowIndex, colIndex, {value: newValue})
      setEditingCell(null)
    },
    [updateCell],
  )

  const selectedCellData = selectedCell
    ? tableData.rows[selectedCell.rowIndex]?.cells[selectedCell.colIndex]
    : null

  return (
    <Card {...elementProps} onClick={(e) => e.stopPropagation()}>
      <Stack space={3} onClick={(e) => e.stopPropagation()}>
        {/* Controls */}
        <Flex gap={2} wrap="wrap">
          <Button
            icon={AddIcon}
            text="Add Column"
            tone="primary"
            mode="ghost"
            onClick={addColumn}
          />
          <Button icon={AddIcon} text="Add Row" tone="primary" mode="ghost" onClick={addRow} />
        </Flex>

        {/* Table */}
        {tableData.headers?.length > 0 && (
          <Card border padding={0} radius={2} overflow="auto" onClick={(e) => e.stopPropagation()}>
            <Box style={{minWidth: '100%', overflowX: 'auto'}} onClick={(e) => e.stopPropagation()}>
              <table
                style={{width: '100%', borderCollapse: 'collapse'}}
                onClick={(e) => e.stopPropagation()}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: '8px',
                        border: '1px solid var(--card-border-color)',
                        width: '40px',
                      }}
                    >
                      <Text size={0} muted>
                        #
                      </Text>
                    </th>
                    {tableData.headers.map((header: Header, colIndex: number) => (
                      <th
                        key={header.key}
                        style={{
                          padding: '8px',
                          border: '1px solid var(--card-border-color)',
                          backgroundColor: header.flagged
                            ? 'var(--card-badge-caution-bg-color)'
                            : 'var(--card-bg-color)',
                          minWidth: '150px',
                        }}
                      >
                        <Stack space={2}>
                          <Flex align="center" gap={2} justify="space-between">
                            <input
                              type="text"
                              value={header.label}
                              onChange={(e) => updateHeader(colIndex, {label: e.target.value})}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                width: '100%',
                                color: 'inherit',
                              }}
                            />
                            <Button
                              icon={TrashIcon}
                              mode="ghost"
                              tone="critical"
                              fontSize={1}
                              padding={2}
                              onClick={() => deleteColumn(colIndex)}
                            />
                          </Flex>
                          <Flex gap={2} wrap="wrap">
                            <Select
                              fontSize={1}
                              value={header.alignment || 'left'}
                              onChange={(e) =>
                                updateHeader(colIndex, {
                                  alignment: e.currentTarget.value as 'left' | 'center' | 'right',
                                })
                              }
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </Select>
                            <Button
                              fontSize={1}
                              padding={2}
                              text={header.flagged ? 'Unflag' : 'Flag'}
                              tone={header.flagged ? 'caution' : 'default'}
                              mode="ghost"
                              onClick={() => toggleColumnFlag(colIndex)}
                            />
                          </Flex>
                        </Stack>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows?.map((row: Row, rowIndex: number) => (
                    <tr key={row.id} onClick={(e) => e.stopPropagation()}>
                      <td
                        style={{
                          padding: '8px',
                          border: '1px solid var(--card-border-color)',
                          textAlign: 'center',
                        }}
                      >
                        <Flex align="center" justify="center" gap={2}>
                          <Text size={1} muted>
                            {rowIndex + 1}
                          </Text>
                          <Button
                            icon={TrashIcon}
                            mode="ghost"
                            tone="critical"
                            fontSize={0}
                            padding={1}
                            onClick={() => deleteRow(rowIndex)}
                          />
                        </Flex>
                      </td>
                      {row.cells?.map((cell: Cell, colIndex: number) => {
                        const header = tableData.headers[colIndex]
                        const isEditing =
                          editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex

                        return (
                          <td
                            key={`${row.id}-${colIndex}`}
                            style={{
                              padding: '8px',
                              border: '1px solid var(--card-border-color)',
                              backgroundColor: cell.flagged
                                ? 'var(--card-badge-caution-bg-color)'
                                : 'transparent',
                              textAlign: header?.alignment || 'left',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isEditing) {
                                startInlineEdit(rowIndex, colIndex, e)
                              }
                            }}
                          >
                            <Flex align="center" gap={2}>
                              <Box flex={1}>
                                {isEditing ? (
                                  <textarea
                                    value={cell.value}
                                    onChange={(e) => {
                                      updateCell(rowIndex, colIndex, {value: e.target.value})
                                    }}
                                    onBlur={() => stopInlineEdit()}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.ctrlKey) {
                                        e.preventDefault()
                                        stopInlineEdit()
                                      }
                                      if (e.key === 'Escape') {
                                        e.preventDefault()
                                        stopInlineEdit()
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                    style={{
                                      width: '100%',
                                      border: '2px solid var(--card-primary-color)',
                                      borderRadius: '4px',
                                      padding: '4px',
                                      fontFamily: 'inherit',
                                      fontSize: '14px',
                                      fontWeight: cell.bold ? 'bold' : 'normal',
                                      fontStyle: cell.italic ? 'italic' : 'normal',
                                      resize: 'none',
                                      minHeight: '20px',
                                      maxHeight: '100px',
                                    }}
                                  />
                                ) : (
                                  <Text
                                    size={1}
                                    weight={cell.bold ? 'bold' : 'regular'}
                                    style={{
                                      fontStyle: cell.italic ? 'italic' : 'normal',
                                    }}
                                  >
                                    {cell.value || (
                                      <span style={{color: 'var(--card-muted-fg-color)'}}>
                                        Click to edit
                                      </span>
                                    )}
                                  </Text>
                                )}
                              </Box>
                              {!isEditing && (
                                <Button
                                  icon={EditIcon}
                                  mode="ghost"
                                  fontSize={0}
                                  padding={1}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openCellEditor(rowIndex, colIndex, e)
                                  }}
                                />
                              )}
                            </Flex>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Card>
        )}

        {tableData.headers?.length === 0 && (
          <Card padding={4} radius={2} tone="transparent" border>
            <Flex align="center" justify="center">
              <Text size={1} muted>
                No columns yet. Click "Add Column" to get started.
              </Text>
            </Flex>
          </Card>
        )}

        {/* Cell Editor Dialog */}
        {showCellEditor && selectedCell && selectedCellData && (
          <Dialog header="Edit Cell" id="cell-editor" onClose={closeCellEditor} width={1}>
            <Card padding={4}>
              <Stack space={4}>
                <Stack space={2}>
                  <Text size={1} weight="semibold">
                    Content
                  </Text>
                  <textarea
                    value={selectedCellData.value}
                    onChange={(e) => {
                      updateCell(selectedCell.rowIndex, selectedCell.colIndex, {
                        value: e.target.value,
                      })
                    }}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--card-border-color)',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </Stack>

                <Stack space={3}>
                  <Text size={1} weight="semibold">
                    Formatting
                  </Text>
                  <Flex gap={2} wrap="wrap">
                    <Button
                      text="Bold"
                      mode={selectedCellData.bold ? 'default' : 'ghost'}
                      tone={selectedCellData.bold ? 'primary' : 'default'}
                      onClick={() =>
                        updateCell(selectedCell.rowIndex, selectedCell.colIndex, {
                          bold: !selectedCellData.bold,
                        })
                      }
                    />
                    <Button
                      text="Italic"
                      mode={selectedCellData.italic ? 'default' : 'ghost'}
                      tone={selectedCellData.italic ? 'primary' : 'default'}
                      onClick={() =>
                        updateCell(selectedCell.rowIndex, selectedCell.colIndex, {
                          italic: !selectedCellData.italic,
                        })
                      }
                    />
                    <Button
                      text={selectedCellData.flagged ? 'Unflag Cell' : 'Flag Cell'}
                      mode="ghost"
                      tone={selectedCellData.flagged ? 'caution' : 'default'}
                      onClick={() => toggleCellFlag(selectedCell.rowIndex, selectedCell.colIndex)}
                    />
                  </Flex>
                </Stack>

                <Flex justify="flex-end" gap={2}>
                  <Button text="Close" mode="ghost" onClick={closeCellEditor} />
                </Flex>
              </Stack>
            </Card>
          </Dialog>
        )}
      </Stack>
    </Card>
  )
}

export default TableInput
