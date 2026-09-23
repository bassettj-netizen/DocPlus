import { useMemo, useState } from 'react'
import { avatarSizeEnum, constants, Layout, toastPlacements, Typography, useNotifications } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import haufeWordmark from '../../../assets/haufe-wordmark.svg'
import { CHANGE_NOTIFICATION_TEXT, PENDING_CHANGES, type LegalChange } from './data'
import type { ChangeLogEntry, ChangeStatus } from '../change-log/data'
import { addChangeLogEntry } from '../change-log/store'
import TruncatedCell from '../TruncatedCell'
import LegalChangesSidebar from './LegalChangesSidebar'
import TemplatesTableCard from './TemplatesTableCard'
import PendingTemplatePanel from './PendingTemplatePanel'
import UpdateTemplatePanel, { type UpdateDraft } from './UpdateTemplatePanel'

const { colorPalette } = constants

type PanelStep = 'closed' | 'pending-info' | 'update'

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

// Sorting the Inbound Date column by the raw DD/MM/YYYY string would order it
// alphabetically, so it is compared as a real date.
function parseDate(value: string) {
  const [day, month, year] = value.split('/')
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
}

export default function LegalChangesPage() {
  const { notification } = useNotifications()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [search, setSearch] = useState('')

  const [pending, setPending] = useState<LegalChange[]>(PENDING_CHANGES)

  const [panelStep, setPanelStep] = useState<PanelStep>('closed')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<UpdateDraft>(EMPTY_DRAFT)

  const activeChange = useMemo(() => pending.find((change) => change.id === activeId) ?? null, [pending, activeId])

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return pending
    return pending.filter(
      (change) =>
        change.templateName.toLowerCase().includes(query) || change.haufeIndex.toLowerCase().includes(query),
    )
  }, [pending, search])

  const openChange = (change: LegalChange) => {
    setActiveId(change.id)
    setPanelStep('pending-info')
  }

  const closePanel = () => {
    setPanelStep('closed')
    setActiveId(null)
    setDraft(EMPTY_DRAFT)
  }

  /** Removes a change from the Pending queue once it's been reviewed, and
   *  records the outcome in the Change Log — the single history of record
   *  across Back Office. `changeNotification` defaults to the standard
   *  Content Hub excerpt but callers may override it with the user's own
   *  notification text. */
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
    closePanel()
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
    setPanelStep('update')
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
    // checked becomes the record shown in the Change Log; otherwise it falls
    // back to the default excerpt `recordReview` already fills in.
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
    // Reflects the actual outcome rather than a generic confirmation — a
    // future update date schedules the template, a today-or-past date
    // publishes it immediately.
    notification.success({
      title: status === 'scheduled' ? `Template scheduled for ${formatDate(draft.updateDate)}` : 'Template updated',
      placement: toastPlacements.TOP_RIGHT,
    })
    closePanel()
  }

  const columns: TableColumnsType<LegalChange> = [
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
      customSidebar={<LegalChangesSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />}
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
          Legal Changes
        </Typography>

        <Typography>Review legal amendments and decide whether to update or discard them.</Typography>

        <TemplatesTableCard
          searchValue={search}
          onSearchChange={setSearch}
          columns={columns}
          rows={rows}
          emptyDescription={isFiltered ? 'No templates match your search.' : 'There are no changes yet.'}
          resetKey={search.trim().toLowerCase()}
        />
      </div>

      <PendingTemplatePanel
        visible={panelStep === 'pending-info'}
        change={activeChange}
        onClose={closePanel}
        onDiscard={handleDiscard}
        onStartUpdate={handleStartUpdate}
      />

      <UpdateTemplatePanel
        visible={panelStep === 'update'}
        change={activeChange}
        draft={draft}
        onDraftChange={setDraft}
        onClose={closePanel}
        onSave={handleSaveUpdate}
      />
    </Layout>
  )
}
