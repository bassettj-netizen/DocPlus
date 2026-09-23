import { constants, SearchBar, Table, Typography } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import type { ChangeLogEntry } from './data'

const { colorPalette } = constants

interface ChangeLogTableCardProps {
  searchValue: string
  onSearchChange: (value: string) => void
  columns: TableColumnsType<ChangeLogEntry>
  rows: ChangeLogEntry[]
  /** Shown inside the table body when `rows` is empty. */
  emptyDescription: string
  /** Remounts the table (resetting it to page 1) whenever this changes — see ChangeLogPage. */
  resetKey: string
}

export default function ChangeLogTableCard({
  searchValue,
  onSearchChange,
  columns,
  rows,
  emptyDescription,
  resetKey,
}: ChangeLogTableCardProps) {
  return (
    <div
      className="back-office-table"
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '16px 0',
        backgroundColor: colorPalette.white,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography as="span" size="heading-md" weight="semibold">
            Change History
          </Typography>
        </div>

        <div style={{ width: 300, flexShrink: 0 }}>
          <SearchBar placeholder="Search for template" value={searchValue} onChange={onSearchChange} width="expanded" />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px' }}>
        <Table<ChangeLogEntry>
          // Remounted on search change so pagination always starts back on
          // page 1 — otherwise a filtered result set shorter than the current
          // page would render empty.
          key={resetKey}
          dataSource={rows}
          columns={columns}
          rowKey="id"
          pagination={{ defaultPageSize: 10 }}
          emptyState={{ variant: 'empty', description: emptyDescription }}
        />
      </div>
    </div>
  )
}
