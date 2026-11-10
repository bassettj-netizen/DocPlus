import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Banner, bannerStyles, bannerVariants, ButtonPrimary, Chip, chipStyles, constants, iconType, SearchBar, Table, Tabs, Tooltip, Typography } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import AppLayout from '../shared/AppLayout'
import { ARCHIVE_RETENTION_DAYS, ARCHIVE_SYSTEM, archivedCount, GENERIC_ARCHIVE_SYSTEM, EMPLOYEES, employeeName, formatDate, type HrdDocument } from '../shared/data'
import { ArchivedChip } from '../shared/DocumentsPage'
import { useDocuments } from '../shared/store'
import { UpgradeDot, UpgradeModal } from '../shared/Upgrade'
import { useArchivingVersion } from '../shared/version'
import { DeletionDate } from '../version11/DocumentsPage'

const { colorPalette } = constants

type DocumentsTab = 'open' | 'archived'

/** "8 employees", underlined like the Figma "Created for" link, with the names on hover. */
function CreatedFor({ doc }: { doc: HrdDocument }) {
  const names = (doc.employeeIds ?? []).map((id) => EMPLOYEES.find((e) => e.id === id)).map((e) => (e ? employeeName(e) : ''))
  return (
    <Tooltip title={names.join(', ')}>
      <span style={{ textDecoration: 'underline', cursor: 'default' }}>
        <Typography as="span">{names.length} employees</Typography>
      </span>
    </Tooltip>
  )
}

/** Open bulk documents: how many copies are archived so far, if any. */
function ArchiveProgress({ doc }: { doc: HrdDocument }) {
  const count = archivedCount(doc)
  if (!count) return <Typography as="span">-</Typography>
  return <Chip label={`${count} of ${doc.employeeIds?.length ?? 0} archived`} chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.CheckCircleFilled} />
}

// The Mass creation list: Version 11's Open / Archived tabs for bulk
// documents. "Created for" replaces Employee (one document, many
// employees), as on the Figma bulk Documents screen. A bulk document stays
// in Open until every employee's copy is archived; the Archived column
// shows how far it's got.
export default function BulkDocumentsPage() {
  const navigate = useNavigate()
  const { basePath, archiving, bulkDocumentsHeading } = useArchivingVersion()
  const documents = useDocuments().filter((doc) => doc.employeeIds && !doc.unsaved)
  const [searchParams, setSearchParams] = useSearchParams()
  // Versions 14 and 15 (no archiving): only ever the open documents.
  const tab: DocumentsTab = !archiving && searchParams.get('tab') === 'archived' ? 'archived' : 'open'
  const [search, setSearch] = useState('')
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const open = (doc: HrdDocument) => navigate(`${basePath}/bulk/${doc.id}`)

  const openDocuments = documents.filter((doc) => !doc.archivedAt)
  const archivedDocuments = documents.filter((doc) => doc.archivedAt)
  const query = search.trim().toLowerCase()
  const rows = (tab === 'archived' ? archivedDocuments : openDocuments).filter((doc) => !query || doc.name.toLowerCase().includes(query))

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
    { title: 'Created for', key: 'created-for', width: 150, render: (_, doc) => <CreatedFor doc={doc} /> },
    ...(tab === 'archived'
      ? [
          {
            title: 'Archived',
            key: 'archived',
            width: 190,
            render: (_: unknown, doc: HrdDocument) => (doc.archivedAt ? <ArchivedChip date={doc.archivedAt} label={ARCHIVE_SYSTEM} /> : '-'),
          },
          {
            title: 'Scheduled deletion',
            key: 'deletes',
            width: 200,
            render: (_: unknown, doc: HrdDocument) => (doc.archivedAt ? <DeletionDate archivedAt={doc.archivedAt} /> : '-'),
          },
        ]
      : [
          // Without archiving (Versions 14 and 15) there's no progress to show.
          ...(archiving ? [] : [{ title: 'Archived', key: 'progress', width: 170, render: (_: unknown, doc: HrdDocument) => <ArchiveProgress doc={doc} /> }]),
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
              {bulkDocumentsHeading ? 'Documents' : 'Mass creation'}
            </Typography>
            <ButtonPrimary onClick={() => navigate(`${basePath}/bulk/new/employees`)}>New bulk document</ButtonPrimary>
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
                  {archiving === 'none' ? 'Bulk documents' : tab === 'archived' ? 'Archived bulk documents' : 'Open bulk documents'}
                </Typography>
                <Typography as="span" size="base" color="neutral-darken2">
                  {tab === 'archived'
                    ? `Each employee’s copy is filed in one shared folder in ${GENERIC_ARCHIVE_SYSTEM}.`
                    : archiving
                      ? 'One document, created for several employees.'
                      : `One document, created for several employees. It moves to Archived once every employee’s copy is archived.`}
                </Typography>
              </div>
              <div style={{ width: 300 }}>
                <SearchBar placeholder="Search documents" value={search} onChange={setSearch} width="expanded" />
              </div>
            </div>

            {tab === 'archived' && (
              <Banner
                variant={bannerVariants.INFO}
                bannerStyle={bannerStyles.SUBTLE}
                dismissible={false}
                icon={iconType.InfoCircleFilled}
                header={`Archived documents are deleted from HR Dokumente ${ARCHIVE_RETENTION_DAYS} days after they’re archived`}
                content={`The archived copies stay in their folder in ${GENERIC_ARCHIVE_SYSTEM}. Export them before then if you still need them here.`}
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
                    ? 'No archived bulk documents yet.'
                    : archiving === 'none'
                      ? 'No bulk documents yet. Create one with New bulk document.'
                      : 'No open bulk documents. Create one with New bulk document.',
              }}
            />
          </div>
        </div>
      </div>
      {archiving === 'upgrade' && <UpgradeModal visible={upgradeOpen} onClose={() => setUpgradeOpen(false)} />}
    </AppLayout>
  )
}
