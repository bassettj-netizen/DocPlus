import { useMemo, useState } from 'react'
import { avatarSizeEnum, Chip, constants, Layout, toastPlacements, Typography, useNotifications } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import haufeWordmark from '../../../assets/haufe-wordmark.svg'
import { STATUS_CHIP_STYLES, STATUS_LABELS, type ChangeLogEntry } from './data'
import { updateChangeLogEntry, useChangeLogEntries } from './store'
import TruncatedCell from '../TruncatedCell'
import ChangeLogSidebar from './ChangeLogSidebar'
import ChangeLogTableCard from './ChangeLogTableCard'
import ChangeLogPanel from './ChangeLogPanel'
import CancelPublishingModal from './CancelPublishingModal'

const { colorPalette } = constants

// Sorting the Change Date column by the raw DD/MM/YYYY string would order it
// alphabetically, so it is compared as a real date.
function parseDate(value: string) {
  const [day, month, year] = value.split('/')
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

export default function ChangeLogPage() {
  const { notification } = useNotifications()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const entries = useChangeLogEntries()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const activeEntry = useMemo(() => entries.find((entry) => entry.id === activeId) ?? null, [entries, activeId])
  const confirmingEntry = useMemo(
    () => entries.find((entry) => entry.id === confirmingId) ?? null,
    [entries, confirmingId],
  )

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return entries
    return entries.filter(
      (entry) =>
        entry.templateName.toLowerCase().includes(query) || entry.haufeIndex.toLowerCase().includes(query),
    )
  }, [entries, search])

  const closePanel = () => setActiveId(null)

  const handleCancelPublishing = () => {
    if (!activeEntry) return
    setConfirmingId(activeEntry.id)
  }

  const handleKeepIt = () => setConfirmingId(null)

  const handleConfirmCancel = () => {
    if (!confirmingEntry) return
    updateChangeLogEntry(confirmingEntry.id, { status: 'discarded', changeDate: formatDate(new Date()) })
    notification.success({ title: 'Changes saved!', placement: toastPlacements.TOP_RIGHT })
    setConfirmingId(null)
    closePanel()
  }

  const columns: TableColumnsType<ChangeLogEntry> = [
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      key: 'templateName',
      width: '26%',
      render: (_: unknown, entry: ChangeLogEntry) => (
        <TruncatedCell title={entry.templateName}>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              setActiveId(entry.id)
            }}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {entry.templateName}
          </a>
        </TruncatedCell>
      ),
    },
    {
      title: 'Haufe Index',
      dataIndex: 'haufeIndex',
      key: 'haufeIndex',
      sorter: (a, b) => a.haufeIndex.localeCompare(b.haufeIndex),
    },
    {
      title: 'Change Type',
      dataIndex: 'changeType',
      key: 'changeType',
      sorter: (a, b) => a.changeType.localeCompare(b.changeType),
    },
    {
      title: 'Change Reason',
      dataIndex: 'changeReason',
      key: 'changeReason',
      sorter: (a, b) => a.changeReason.localeCompare(b.changeReason),
    },
    {
      title: 'Change Date',
      dataIndex: 'changeDate',
      key: 'changeDate',
      sorter: (a, b) => parseDate(a.changeDate) - parseDate(b.changeDate),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (_: unknown, entry: ChangeLogEntry) => (
        <Chip label={STATUS_LABELS[entry.status]} chipStyle={STATUS_CHIP_STYLES[entry.status]} uppercase />
      ),
    },
  ]

  const isFiltered = search.trim().length > 0

  return (
    <Layout
      header={{
        // The DS's own <HaufeLogo> only offers discrete preset heights
        // (12/24/32/56px) via its `size` enum — none hit the 10px the design
        // calls for — so the wordmark is rendered directly via `leftItems`
        // instead, sized exactly. Centered explicitly here (rather than
        // relying on the Header's own internal flex alignment) so it stays
        // centered regardless of that implementation detail.
        leftItems: [
          <div key="haufe-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <img src={haufeWordmark} alt="Haufe" style={{ height: 10, width: 'auto', display: 'block' }} />
          </div>,
        ],
        avatar: { srcPlaceholder: 'LC', size: avatarSizeEnum.SMALL },
      }}
      customSidebar={<ChangeLogSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 16,
          height: '100%',
          minHeight: 0,
          backgroundColor: colorPalette.neutral.lighten5,
        }}
      >
        <Typography as="h1" size="heading-lg" weight="bold">
          Change Log
        </Typography>

        <Typography>A history of all template changes.</Typography>

        <ChangeLogTableCard
          searchValue={search}
          onSearchChange={setSearch}
          columns={columns}
          rows={rows}
          emptyDescription={isFiltered ? 'No templates match your search.' : 'There are no changes yet.'}
          resetKey={search.trim().toLowerCase()}
        />
      </div>

      <ChangeLogPanel
        visible={activeId !== null}
        entry={activeEntry}
        onClose={closePanel}
        onCancelPublishing={handleCancelPublishing}
      />

      <CancelPublishingModal entry={confirmingEntry} onKeepIt={handleKeepIt} onConfirm={handleConfirmCancel} />
    </Layout>
  )
}
