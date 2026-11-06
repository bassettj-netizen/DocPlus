import { useMemo, useState, type Key } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ButtonGhost, constants, iconType, SearchBar, Table, Toggle, Typography } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import AppLayout from '../shared/AppLayout'
import CreateFlowFooter from '../shared/CreateFlowFooter'
import { EMPLOYEES, type Employee } from '../shared/data'
import { useArchivingVersion } from '../shared/version'

const { colorPalette } = constants

const COLUMNS: TableColumnsType<Employee> = [
  { title: 'First name', dataIndex: 'firstName', key: 'firstName' },
  { title: 'Last name', dataIndex: 'lastName', key: 'lastName' },
  { title: 'Position', dataIndex: 'position', key: 'position' },
  { title: 'Organisation', dataIndex: 'organisation', key: 'organisation' },
]

// Step 1 of Mass creation, as on the Figma bulk "Select an employee" screen:
// the Individual flow's employee list with checkboxes instead of radios, and
// "Show only selected employees" to check the choice before continuing.
export default function SelectEmployeesPage() {
  const navigate = useNavigate()
  const { basePath } = useArchivingVersion()
  const [searchParams] = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>(() => searchParams.get('employees')?.split(',').filter(Boolean) ?? [])
  const [search, setSearch] = useState('')
  const [onlySelected, setOnlySelected] = useState(false)

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return EMPLOYEES.filter((e) => (!onlySelected || selectedIds.includes(e.id)) && (!query || `${e.firstName} ${e.lastName}`.toLowerCase().includes(query)))
  }, [search, onlySelected, selectedIds])

  // Search and "only selected" hide rows, but never drop them from the selection.
  const changeRows = (keys: Key[]) => {
    const visible = new Set(rows.map((e) => e.id))
    setSelectedIds([...selectedIds.filter((id) => !visible.has(id)), ...keys.map(String)])
  }

  return (
    <AppLayout>
      <div className="back-office-table" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16, padding: 16, backgroundColor: colorPalette.neutral.lighten5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <ButtonGhost leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(`${basePath}/bulk`)}>
            Back to documents
          </ButtonGhost>
          <Typography as="h1" size="heading-lg" weight="bold" color="neutral-darken5">
            Select employees
          </Typography>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderRadius: 16, backgroundColor: colorPalette.white }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Typography as="span" size="heading-md" weight="semibold">
                Employees
              </Typography>
              <Typography as="span" size="base-sm" color="neutral-darken2">
                {selectedIds.length ? `${selectedIds.length} selected — each gets their own copy of the document.` : 'Choose who the document is for. Each gets their own copy.'}
              </Typography>
            </div>
            <Toggle checked={onlySelected} onChange={setOnlySelected}>
              Show only selected employees
            </Toggle>
            <div style={{ width: 300 }}>
              <SearchBar placeholder="Search for employee" value={search} onChange={setSearch} width="expanded" />
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Table<Employee>
              dataSource={rows}
              columns={COLUMNS}
              rowKey="id"
              pagination={false}
              selectable
              selectionType="checkbox"
              selectedRows={EMPLOYEES.filter((e) => selectedIds.includes(e.id))}
              onChangeRows={changeRows}
              emptyState={{ variant: 'empty', description: 'No employees match.' }}
            />
          </div>

          <CreateFlowFooter
            step={0}
            continueDisabled={!selectedIds.length}
            onContinue={() => navigate(`${basePath}/bulk/new/template?employees=${selectedIds.join(',')}`)}
          />
        </div>
      </div>
    </AppLayout>
  )
}
