import { useMemo, useState } from 'react'
import { avatarSizeEnum, Chip, constants, Layout, Tabs, toastPlacements, Typography, useNotifications } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import haufeWordmark from '../../../assets/haufe-wordmark.svg'
import { CHANGE_NOTIFICATION_TEXT, PENDING_CHANGES, type LegalChange } from '../legal-changes/data'
import TemplatesTableCard from '../legal-changes/TemplatesTableCard'
import PendingTemplatePanel from '../legal-changes/PendingTemplatePanel'
import UpdateTemplatePanel, { type UpdateDraft } from '../legal-changes/UpdateTemplatePanel'
import { STATUS_CHIP_STYLES, STATUS_LABELS, type ChangeLogEntry, type ChangeStatus } from '../change-log/data'
import { addChangeLogEntry, updateChangeLogEntry, useChangeLogEntries } from '../change-log/store'
import ChangeLogTableCard from '../change-log/ChangeLogTableCard'
import ChangeLogPanel from '../change-log/ChangeLogPanel'
import CancelPublishingModal from '../change-log/CancelPublishingModal'
import TruncatedCell from '../TruncatedCell'
import UpdatesSidebar from './UpdatesSidebar'

const { colorPalette } = constants

type ActiveTab = 'pending' | 'history'
type PendingPanelStep = 'closed' | 'pending-info' | 'update'

const EMPTY_DRAFT: UpdateDraft = {
  updatedTemplateId: '',
  author: '',
  folder: '',
  updateDate: undefined,
  sendNotification: false,
  notificationText: '',
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

/** A template goes live the day its update date lands, so anything later is scheduled. */
function statusForUpdateDate(date: Date): ChangeStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() > today.getTime() ? 'scheduled' : 'published'
}

// Sorting a DD/MM/YYYY date column by the raw string would order it
// alphabetically, so it is compared as a real date.
function parseDate(value: string) {
  const [day, month, year] = value.split('/')
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
}

// Updates combines Legal Changes (the pending review queue) and Change Log
// (the full history) behind one set of tabs, sharing a single header,
// sidebar, title and description. Each tab otherwise owns the exact same
// state/behaviour as its standalone page — see legal-changes/LegalChangesPage
// and change-log/ChangeLogPage, which this mirrors side by side rather than
// introducing a new shared abstraction between two already-independent flows.
export default function UpdatesPage() {
  const { notification } = useNotifications()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('pending')
  const [search, setSearch] = useState('')

  const changeTab = (tab: ActiveTab) => {
    setActiveTab(tab)
    setSearch('')
  }

  // --- Pending tab (mirrors legal-changes/LegalChangesPage.tsx) ---
  const [pending, setPending] = useState<LegalChange[]>(PENDING_CHANGES)
  const [pendingPanelStep, setPendingPanelStep] = useState<PendingPanelStep>('closed')
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null)
  const [draft, setDraft] = useState<UpdateDraft>(EMPTY_DRAFT)

  const activeChange = useMemo(
    () => pending.find((change) => change.id === activeChangeId) ?? null,
    [pending, activeChangeId],
  )

  const pendingRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return pending
    return pending.filter(
      (change) =>
        change.templateName.toLowerCase().includes(query) || change.haufeIndex.toLowerCase().includes(query),
    )
  }, [pending, search])

  const openChange = (change: LegalChange) => {
    setActiveChangeId(change.id)
    setPendingPanelStep('pending-info')
  }

  const closePendingPanel = () => {
    setPendingPanelStep('closed')
    setActiveChangeId(null)
    setDraft(EMPTY_DRAFT)
  }

  /** Removes a change from the Pending queue once it's been reviewed, and
   *  records the outcome in the shared Change Log store that backs the
   *  History tab. */
  const recordReview = (
    change: LegalChange,
    entry: Omit<
      ChangeLogEntry,
      'id' | 'templateName' | 'haufeIndex' | 'changeType' | 'changeReason' | 'originalTemplateId' | 'source' | 'legalUpdate'
    >,
  ) => {
    setPending((current) => current.filter((item) => item.id !== change.id))
    addChangeLogEntry({
      id: `legal-${change.id}`,
      templateName: change.templateName,
      haufeIndex: change.haufeIndex,
      changeType: 'Update',
      changeReason: 'Legal Update',
      originalTemplateId: change.originalTemplateId,
      source: 'Content hub',
      legalUpdate: change.legalUpdate,
      changeNotification: CHANGE_NOTIFICATION_TEXT,
      ...entry,
    })
  }

  const handleDiscard = () => {
    if (!activeChange) return
    recordReview(activeChange, {
      status: 'discarded',
      changeDate: formatDate(new Date()),
      updatedTemplateId: activeChange.haufeIndex,
      author: activeChange.author,
      folder: activeChange.folder,
    })
    notification.success({ title: 'Legal change discarded', placement: toastPlacements.TOP_RIGHT })
    closePendingPanel()
  }

  const handleStartUpdate = () => {
    if (!activeChange) return
    setDraft({
      updatedTemplateId: '',
      author: activeChange.author,
      folder: '',
      updateDate: undefined,
      sendNotification: false,
      notificationText: '',
    })
    setPendingPanelStep('update')
  }

  const handleSaveUpdate = () => {
    if (!activeChange) return

    // The panel has no inline validation in the design — an incomplete form
    // surfaces the designed error toast instead.
    if (!draft.updatedTemplateId.trim() || !draft.folder || !draft.updateDate) {
      notification.error({
        title: 'There was an issue saving the changes. Please try again.',
        placement: toastPlacements.TOP_RIGHT,
      })
      return
    }

    // A custom notification the user wrote while "Inform HRD users" was
    // checked becomes the record shown in the History tab; otherwise it
    // falls back to the default excerpt `recordReview` already fills in.
    const customNotification = draft.sendNotification ? draft.notificationText.trim() : ''
    const status = statusForUpdateDate(draft.updateDate)

    recordReview(activeChange, {
      status,
      changeDate: formatDate(draft.updateDate),
      updatedTemplateId: draft.updatedTemplateId.trim(),
      author: draft.author,
      folder: draft.folder,
      ...(customNotification && { changeNotification: customNotification }),
    })
    notification.success({
      title: status === 'scheduled' ? `Template scheduled for ${formatDate(draft.updateDate)}` : 'Template updated',
      placement: toastPlacements.TOP_RIGHT,
    })
    closePendingPanel()
  }

  const pendingColumns: TableColumnsType<LegalChange> = [
    {
      title: 'Template Name',
      dataIndex: 'templateName',
      key: 'templateName',
      width: '32%',
      render: (_: unknown, change: LegalChange) => (
        <TruncatedCell title={change.templateName}>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              openChange(change)
            }}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {change.templateName}
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
      title: 'Inbound Date',
      dataIndex: 'inboundDate',
      key: 'inboundDate',
      sorter: (a, b) => parseDate(a.inboundDate) - parseDate(b.inboundDate),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      sorter: (a, b) => a.source.localeCompare(b.source),
    },
  ]

  // --- History tab (mirrors change-log/ChangeLogPage.tsx) ---
  const entries = useChangeLogEntries()
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const activeEntry = useMemo(() => entries.find((entry) => entry.id === activeEntryId) ?? null, [entries, activeEntryId])
  const confirmingEntry = useMemo(
    () => entries.find((entry) => entry.id === confirmingId) ?? null,
    [entries, confirmingId],
  )

  const historyRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return entries
    return entries.filter(
      (entry) =>
        entry.templateName.toLowerCase().includes(query) || entry.haufeIndex.toLowerCase().includes(query),
    )
  }, [entries, search])

  const closeHistoryPanel = () => setActiveEntryId(null)

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
    closeHistoryPanel()
  }

  const historyColumns: TableColumnsType<ChangeLogEntry> = [
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
              setActiveEntryId(entry.id)
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
  const emptyDescription = isFiltered ? 'No templates match your search.' : 'There are no changes yet.'

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
      customSidebar={<UpdatesSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />}
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
          Updates
        </Typography>

        <Typography>Review pending legal changes and browse the full history of template updates.</Typography>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => changeTab(key as ActiveTab)}
          options={[
            { key: 'pending', label: 'Pending Changes', content: null },
            { key: 'history', label: 'Change History', content: null },
          ]}
        />

        {activeTab === 'pending' ? (
          <TemplatesTableCard
            searchValue={search}
            onSearchChange={setSearch}
            columns={pendingColumns}
            rows={pendingRows}
            emptyDescription={emptyDescription}
            resetKey={`pending:${search.trim().toLowerCase()}`}
          />
        ) : (
          <ChangeLogTableCard
            searchValue={search}
            onSearchChange={setSearch}
            columns={historyColumns}
            rows={historyRows}
            emptyDescription={emptyDescription}
            resetKey={`history:${search.trim().toLowerCase()}`}
          />
        )}
      </div>

      <PendingTemplatePanel
        visible={pendingPanelStep === 'pending-info'}
        change={activeChange}
        onClose={closePendingPanel}
        onDiscard={handleDiscard}
        onStartUpdate={handleStartUpdate}
      />

      <UpdateTemplatePanel
        visible={pendingPanelStep === 'update'}
        change={activeChange}
        draft={draft}
        onDraftChange={setDraft}
        onClose={closePendingPanel}
        onSave={handleSaveUpdate}
      />

      <ChangeLogPanel
        visible={activeEntryId !== null}
        entry={activeEntry}
        onClose={closeHistoryPanel}
        onCancelPublishing={handleCancelPublishing}
      />

      <CancelPublishingModal entry={confirmingEntry} onKeepIt={handleKeepIt} onConfirm={handleConfirmCancel} />
    </Layout>
  )
}
