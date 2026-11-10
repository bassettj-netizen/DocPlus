import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Banner, bannerStyles, bannerVariants, ButtonPrimary, Chip, chipStyles, chipVariants, constants, iconType, SearchBar, Table, Tabs, Toggle, Tooltip, Typography } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import AppLayout from '../shared/AppLayout'
import { ARCHIVE_RETENTION_DAYS, ARCHIVE_SYSTEM, archiveDeletion, GENERIC_ARCHIVE_SYSTEM, EMPLOYEES, employeeName, formatDate, type HrdDocument } from '../shared/data'
import { ArchivedChip, DocumentsCreated } from '../shared/DocumentsPage'
import { useDocuments } from '../shared/store'
import { UpgradeDot, UpgradeModal } from '../shared/Upgrade'
import { useArchivingVersion } from '../shared/version'

const { colorPalette } = constants

type DocumentsTab = 'open' | 'archived'

const TAB_TITLES: Record<DocumentsTab, string> = { open: 'Open documents', archived: 'Archived documents' }

/** "You" for the user's own documents; the colleague's name and a Shared chip otherwise. */
function Owner({ doc }: { doc: HrdDocument }) {
  if (!doc.sharedBy) return <Typography as="span">You</Typography>
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Typography as="span">{doc.sharedBy}</Typography>
      <Chip label="Shared" chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} uppercase />
    </span>
  )
}

// Deletion is close enough to call out once a week or less is left.
const DELETION_WARNING_DAYS = 7

/** When an archived document leaves HR Dokumente: the date, or a warning chip with the days left in the last week. */
export function DeletionDate({ archivedAt }: { archivedAt: Date }) {
  const { deletesAt, daysLeft } = archiveDeletion(archivedAt)
  const { genericArchiveSystem, scheduledDeletion } = useArchivingVersion()
  const system = genericArchiveSystem ? GENERIC_ARCHIVE_SYSTEM : ARCHIVE_SYSTEM
  const remaining = daysLeft === 0 ? 'Today' : `In ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
  if (daysLeft <= DELETION_WARNING_DAYS) {
    return (
      <Tooltip title={`${scheduledDeletion ? 'Will be deleted' : 'Deleted'} from HR Dokumente on ${formatDate(deletesAt)}. The copy in ${system} stays.`}>
        <span>
          <Chip label={remaining} chipStyle={chipStyles.SEMANTIC_WARNING} leftIcon={iconType.InfoCircleOutlined} uppercase />
        </span>
      </Tooltip>
    )
  }
  return formatDate(deletesAt)
}

function employeeOf(doc: HrdDocument) {
  const employee = EMPLOYEES.find((e) => e.id === doc.employeeId)
  return employee ? employeeName(employee) : '-'
}

// "Open and archived": the Documents list is grouped by where a document is
// in its life — Open (still being worked on) or Archived (filed in the HR
// system) — instead of by who owns it. Documents shared with the user sit in
// either tab alongside their own, told apart by the Owner column.
export default function DocumentsPage() {
  const navigate = useNavigate()
  const { basePath, genericArchiveSystem, searchNameOnly, largeListDescription, scheduledDeletion, archiving, noSharing, noEmployee, documentsHeading } = useArchivingVersion()
  const archiveSystem = genericArchiveSystem ? GENERIC_ARCHIVE_SYSTEM : ARCHIVE_SYSTEM
  // Versions 13–15 (Figma "Documents" Archived tab): "Filed in your HR system", without the personnel file.
  const archiveLocation = genericArchiveSystem ? `Filed in ${archiveSystem}` : `Filed in the employee’s personnel file in ${archiveSystem}`
  // New documents are only listed once they've been saved. Bulk documents
  // (Version 13's Mass creation) have their own list.
  const documents = useDocuments().filter((doc) => !doc.unsaved && !doc.employeeIds)
  const [searchParams, setSearchParams] = useSearchParams()
  // Versions 14 and 15 (no archiving): only ever the open documents.
  const tab: DocumentsTab = !archiving && searchParams.get('tab') === 'archived' ? 'archived' : 'open'
  const [search, setSearch] = useState('')
  const [bulkEdit, setBulkEdit] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const open = (doc: HrdDocument) => navigate(`${basePath}/documents/${doc.id}`)

  const openDocuments = documents.filter((doc) => !doc.archivedAt)
  const archivedDocuments = documents.filter((doc) => doc.archivedAt)
  const query = search.trim().toLowerCase()
  const rows = (tab === 'archived' ? archivedDocuments : openDocuments).filter(
    (doc) => !query || doc.name.toLowerCase().includes(query) || (!searchNameOnly && employeeOf(doc).toLowerCase().includes(query)),
  )

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
    ...(noEmployee ? [] : [{ title: 'Employee', key: 'employee', width: 170, render: (_: unknown, doc: HrdDocument) => employeeOf(doc) }]),
    ...(noSharing ? [] : [{ title: 'Owner', key: 'owner', width: 210, render: (_: unknown, doc: HrdDocument) => <Owner doc={doc} /> }]),
    ...(tab === 'archived'
      ? [
          {
            title: 'Archived',
            key: 'archived',
            width: 190,
            render: (_: unknown, doc: HrdDocument) => (doc.archivedAt ? <ArchivedChip date={doc.archivedAt} label={ARCHIVE_SYSTEM} /> : '-'),
          },
          {
            title: scheduledDeletion ? 'Scheduled deletion' : 'Deleted on',
            key: 'deletes',
            width: 200,
            render: (_: unknown, doc: HrdDocument) => (doc.archivedAt ? <DeletionDate archivedAt={doc.archivedAt} /> : '-'),
          },
        ]
      : [
          { title: 'Creation date', key: 'created', width: 125, render: (_: unknown, doc: HrdDocument) => formatDate(doc.createdAt) },
          { title: 'Last modified', key: 'modified', width: 125, render: (_: unknown, doc: HrdDocument) => formatDate(doc.modifiedAt) },
        ]),
  ]

  return (
    <AppLayout>
      <div className="back-office-table" style={{ height: '100%', overflowY: 'auto', backgroundColor: colorPalette.neutral.lighten5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, minHeight: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography as="h1" size="heading-lg" weight="bold" color="neutral-darken5">
              {documentsHeading ? 'Documents' : 'Choose a new or existing document'}
            </Typography>
            <ButtonPrimary onClick={() => navigate(`${basePath}/new/${noEmployee ? 'template' : 'employee'}`)}>New document</ButtonPrimary>
          </div>

          {/* Version 15 has no tabs; Version 14's Archived tab carries the upgrade dot and opens the upgrade dialog. */}
          {archiving !== 'none' && (
            <Tabs
              activeKey={tab}
              onChange={(key: string) => {
                if (key === 'archived' && archiving === 'upgrade') {
                  setUpgradeOpen(true)
                  return
                }
                setSearchParams(key === 'open' ? {} : { tab: key })
                setSearch('')
              }}
              options={[
                { key: 'open', label: `Open (${openDocuments.length})`, content: null },
                archiving === 'upgrade'
                  ? { key: 'archived', label: <UpgradeDot>Archived</UpgradeDot>, content: null }
                  : { key: 'archived', label: `Archived (${archivedDocuments.length})`, content: null },
              ]}
            />
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderRadius: 16, backgroundColor: colorPalette.white }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Typography as="span" size="heading-md" weight="semibold">
                  {archiving === 'none' ? 'My documents' : TAB_TITLES[tab]}
                </Typography>
                <Typography as="span" size={largeListDescription ? 'base' : 'base-sm'} color="neutral-darken2">
                  {tab === 'archived'
                    ? `${archiveLocation}.${noSharing ? '' : ' Includes documents shared with you.'}`
                    : noSharing
                      ? 'Documents you’re still working on.'
                      : archiving === 'none'
                      ? 'Documents you or your colleagues are working on. Includes documents shared with you.'
                      : 'Documents you or your colleagues are still working on. Includes documents shared with you.'}
                </Typography>
              </div>
              <Toggle checked={bulkEdit} onChange={setBulkEdit}>
                Bulk edit
              </Toggle>
              <div style={{ width: 300 }}>
                <SearchBar placeholder={searchNameOnly ? 'Search documents' : 'Search by document or employee'} value={search} onChange={setSearch} width="expanded" />
              </div>
            </div>

            {/* The retention rule, stated once above the list; the Deleted on (Scheduled
                deletion) column then gives each document's own date. */}
            {tab === 'archived' && (
              <Banner
                variant={bannerVariants.INFO}
                bannerStyle={bannerStyles.SUBTLE}
                dismissible={false}
                icon={iconType.InfoCircleFilled}
                header={`Archived documents are deleted from HR Dokumente ${ARCHIVE_RETENTION_DAYS} days after they’re archived`}
                content={`The archived copy stays ${archiveLocation.replace(/^Filed in/, 'in')}. Export a copy before then if you still need it here.`}
              />
            )}

            <Table<HrdDocument>
              key={`${tab}-${query}`}
              dataSource={rows}
              columns={columns}
              rowKey="id"
              pagination={false}
              actions={(doc) => [{ key: 'open', label: 'Open', props: { onClick: () => open(doc) } }]}
              emptyState={{
                variant: 'empty',
                description: query
                  ? 'No documents match your search.'
                  : tab === 'archived'
                    ? 'No archived documents yet.'
                    : archiving === 'none'
                      ? 'No documents yet. Create one with New document.'
                      : 'No open documents. Create one with New document.',
              }}
            />

            {/* The limit counts the user's own documents, not ones shared with them. */}
            {tab === 'open' && <DocumentsCreated count={documents.filter((doc) => !doc.sharedBy).length} />}
          </div>
        </div>
      </div>
      {archiving === 'upgrade' && <UpgradeModal visible={upgradeOpen} onClose={() => setUpgradeOpen(false)} />}
    </AppLayout>
  )
}
