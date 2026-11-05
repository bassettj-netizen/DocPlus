import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ButtonPrimary, Chip, chipStyles, constants, iconType, SearchBar, Table, Tabs, Toggle, Tooltip, Typography } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import AppLayout from './AppLayout'
import { ARCHIVE_SYSTEM, DOCUMENT_LIMIT, formatDate, type HrdDocument } from './data'
import { isComplete } from './fields'
import { useArchivingStore, useDocuments } from './store'
import { useArchivingVersion } from './version'

const { colorPalette } = constants

type DocumentsTab = 'mine' | 'shared' | 'archived'

/** The "Archived • dd/mm/yyyy" chip from the Figma Documents list, or "Personio • dd/mm/yyyy" where the version names the system. */
export function ArchivedChip({ date, label = 'Archived' }: { date: Date; label?: string }) {
  return <Chip label={`${label} • ${formatDate(date)}`} chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.CheckCircleOutlined} uppercase />
}

// Where a document is in its life, for the Status column: still being
// filled in, ready for the user to complete, or completed and filed. Each
// chip's tooltip says what it means and what to do next.
function DocumentStatus({ doc }: { doc: HrdDocument }) {
  const status = doc.archivedAt
    ? {
        label: `Archived in ${ARCHIVE_SYSTEM} • ${formatDate(doc.archivedAt)}`,
        style: chipStyles.SEMANTIC_SUCCESS,
        icon: iconType.CheckCircleOutlined,
        help: `Completed and filed in the employee’s personnel file in ${ARCHIVE_SYSTEM}. Open it to export a copy.`,
      }
    : doc.fields && isComplete(doc.fields)
      ? {
          label: 'Ready to complete',
          style: chipStyles.SEMANTIC_INFO,
          icon: undefined,
          help: `Every mandatory field is filled in. Open it and choose Complete to archive it in ${ARCHIVE_SYSTEM}.`,
        }
      : { label: 'Draft', style: chipStyles.ACCENT_NEUTRAL, icon: undefined, help: 'Some mandatory fields are still empty.' }
  return (
    <Tooltip title={status.help}>
      <span>
        <Chip label={status.label} chipStyle={status.style} leftIcon={status.icon} uppercase />
      </span>
    </Tooltip>
  )
}

export function DocumentsCreated({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
      <div style={{ width: 72, height: 6, borderRadius: 3, backgroundColor: colorPalette.blue.lighten4, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(1, count / DOCUMENT_LIMIT) * 100}%`, height: '100%', backgroundColor: colorPalette.blue.base }} />
      </div>
      <Typography as="span" size="base-sm" weight="semibold">
        {`${count}/${DOCUMENT_LIMIT}`}
      </Typography>
      <Typography as="span" size="base-sm" weight="semibold">
        Documents created
      </Typography>
    </div>
  )
}

// "Choose a new or existing document": the current Documents list, with the
// Archived column now showing when each document was archived.
export default function DocumentsPage() {
  const navigate = useNavigate()
  const store = useArchivingStore()
  const { basePath, archivedTab, hideUnsaved, newDocument, archiveSystemChip, statusColumn } = useArchivingVersion()
  const allDocuments = useDocuments()
  const documents = hideUnsaved ? allDocuments.filter((doc) => !doc.unsaved) : allDocuments
  const [searchParams, setSearchParams] = useSearchParams()
  // The Finish button design only shows the Archived tab once something has
  // been archived — the first Documents screen has just two tabs, the last
  // one three.
  const showArchivedTab = archivedTab && documents.some((doc) => doc.archivedAt)
  const requestedTab = (searchParams.get('tab') as DocumentsTab | null) ?? 'mine'
  const tab = requestedTab === 'archived' && !showArchivedTab ? 'mine' : requestedTab
  const [search, setSearch] = useState('')
  const [bulkEdit, setBulkEdit] = useState(false)

  const open = (doc: HrdDocument) => navigate(`${basePath}/documents/${doc.id}`)
  const createDocument = () =>
    newDocument
      ? navigate(`${basePath}/documents/${store.createDocument(newDocument.employeeId, newDocument.templateId)}`)
      : navigate(`${basePath}/new/employee`)

  const query = search.trim().toLowerCase()
  let rows = documents.filter((doc) => !query || doc.name.toLowerCase().includes(query))
  if (tab === 'archived') rows = rows.filter((doc) => doc.archivedAt)
  if (tab === 'shared') rows = []

  const columns: TableColumnsType<HrdDocument> = [
    {
      title: 'Document name',
      key: 'name',
      render: (_, doc) => (
        <button type="button" onClick={() => open(doc)} style={{ all: 'unset', cursor: 'pointer' }}>
          {doc.name}
        </button>
      ),
    },
    { title: 'Creation date', key: 'created', width: 125, render: (_, doc) => formatDate(doc.createdAt) },
    { title: 'Last modified', key: 'modified', width: 125, render: (_, doc) => formatDate(doc.modifiedAt) },
    statusColumn
      ? { title: 'Status', key: 'status', width: 270, render: (_, doc) => <DocumentStatus doc={doc} /> }
      : {
          title: 'Archived',
          key: 'archived',
          width: 190,
          render: (_, doc) => (doc.archivedAt ? <ArchivedChip date={doc.archivedAt} label={archiveSystemChip ? ARCHIVE_SYSTEM : undefined} /> : '-'),
        },
  ]

  const tabOptions = [
    { key: 'mine', label: 'My documents', content: null },
    { key: 'shared', label: 'Shared with me', content: null },
    ...(showArchivedTab ? [{ key: 'archived', label: 'Archived', content: null }] : []),
  ]

  const title = tab === 'archived' ? 'Archived documents' : tab === 'shared' ? 'Shared with me' : 'My documents'

  return (
    <AppLayout>
      <div className="back-office-table" style={{ height: '100%', overflowY: 'auto', backgroundColor: colorPalette.neutral.lighten5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, minHeight: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography as="h1" size="heading-lg" weight="bold" color="neutral-darken5">
              Choose a new or existing document
            </Typography>
            <ButtonPrimary onClick={createDocument}>New document</ButtonPrimary>
          </div>

          <Tabs
            activeKey={tab}
            onChange={(key: string) => {
              setSearchParams(key === 'mine' ? {} : { tab: key })
              setSearch('')
            }}
            options={tabOptions}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderRadius: 16, backgroundColor: colorPalette.white }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Typography as="span" size="heading-md" weight="semibold">
                  {title}
                </Typography>
              </div>
              <Toggle checked={bulkEdit} onChange={setBulkEdit}>
                Bulk edit
              </Toggle>
              <div style={{ width: 300 }}>
                <SearchBar placeholder="Search for document" value={search} onChange={setSearch} width="expanded" />
              </div>
            </div>

            <Table<HrdDocument>
              key={`${tab}-${query}`}
              dataSource={rows}
              columns={columns}
              rowKey="id"
              pagination={false}
              actions={(doc) => [{ key: 'open', label: 'Open', props: { onClick: () => open(doc) } }]}
              emptyState={{
                variant: 'empty',
                description:
                  tab === 'shared'
                    ? 'No documents have been shared with you yet.'
                    : tab === 'archived'
                      ? 'No archived documents yet.'
                      : 'No documents match your search.',
              }}
            />

            {tab === 'mine' && <DocumentsCreated count={documents.length} />}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
