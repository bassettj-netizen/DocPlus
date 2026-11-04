import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ButtonGhost, constants, iconType, SearchBar, Table, Typography } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import AppLayout from './AppLayout'
import CreateFlowFooter from './CreateFlowFooter'
import { EMPLOYEES, type Employee } from './data'
import { useArchivingVersion } from './version'

const { colorPalette } = constants

const COLUMNS: TableColumnsType<Employee> = [
  { title: 'First name', dataIndex: 'firstName', key: 'firstName' },
  { title: 'Last name', dataIndex: 'lastName', key: 'lastName' },
  { title: 'Position', dataIndex: 'position', key: 'position' },
  { title: 'Organisation', dataIndex: 'organisation', key: 'organisation' },
]

// Step 1 of creating a document, as on the Figma "Select an employee" screen.
export default function SelectEmployeePage() {
  const navigate = useNavigate()
  const { basePath } = useArchivingVersion()
  const [searchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | undefined>(searchParams.get('employee') ?? undefined)
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return EMPLOYEES.filter((e) => !query || `${e.firstName} ${e.lastName}`.toLowerCase().includes(query))
  }, [search])

  const selected = EMPLOYEES.filter((e) => e.id === selectedId)

  return (
    <AppLayout>
      <div className="back-office-table" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16, padding: 16, backgroundColor: colorPalette.neutral.lighten5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <ButtonGhost leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(`${basePath}/documents`)}>
            Back to documents
          </ButtonGhost>
          <Typography as="h1" size="heading-lg" weight="bold" color="neutral-darken5">
            Select an employee
          </Typography>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderRadius: 16, backgroundColor: colorPalette.white }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Typography as="span" size="heading-md" weight="semibold">
                Employees
              </Typography>
            </div>
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
              selectionType="radio"
              selectedRows={selected}
              onChangeRows={(keys) => setSelectedId(keys[0] as string | undefined)}
            />
          </div>

          <CreateFlowFooter
            step={0}
            continueDisabled={!selectedId}
            onContinue={() => navigate(`${basePath}/new/template?employee=${selectedId}`)}
          />
        </div>
      </div>
    </AppLayout>
  )
}
