import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ButtonPrimary, constants, SearchBar, searchbarVariants, Table, Tabs, Toggle, Typography } from '@goat-ui/goat-ui-core'
import type { TableColumnsType } from '@goat-ui/goat-ui-core'
import AppLayout from '../archiving/shared/AppLayout'
import { formatDate, type HrdDocument } from '../archiving/shared/data'
import { DocumentsCreated } from '../archiving/shared/DocumentsPage'
import { useDocuments } from '../archiving/shared/store'
import { useArchivingVersion } from '../archiving/shared/version'

const { colorPalette } = constants

type DocumentsTab = 'mine' | 'shared'

const TAB_TITLES: Record<DocumentsTab, string> = { mine: 'My documents', shared: 'Shared with me' }

const byText = (value: (doc: HrdDocument) => string) => (a: HrdDocument, b: HrdDocument) => value(a).localeCompare(value(b))
const byDate = (value: (doc: HrdDocument) => Date | undefined) => (a: HrdDocument, b: HrdDocument) => (value(a)?.getTime() ?? 0) - (value(b)?.getTime() ?? 0)

// The Figma "My documents" list (Create new document › Document list):
// My documents / Shared with me tabs, Document name, Creation date, Last
// modified and Archived (left empty), all sortable. Version 13's documents —
// the user's own under My documents, colleagues' under Shared with me, where
// an Owner column says whose they are. (The Figma's Legal updates chip is
// left out.)
export default function DocumentsPage() {
  const navigate = useNavigate()
  const { basePath, noEmployee } = useArchivingVersion()
  // New documents are only listed once they've been saved.
  const documents = useDocuments().filter((doc) => !doc.unsaved && !doc.employeeIds)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: DocumentsTab = searchParams.get('tab') === 'shared' ? 'shared' : 'mine'
  const [search, setSearch] = useState('')
  const [bulkEdit, setBulkEdit] = useState(false)

  const open = (doc: HrdDocument) => navigate(`${basePath}/documents/${doc.id}`)

  const myDocuments = documents.filter((doc) => !doc.sharedBy)
  const sharedDocuments = documents.filter((doc) => doc.sharedBy)
  const query = search.trim().toLowerCase()
  const rows = (tab === 'shared' ? sharedDocuments : myDocuments).filter((doc) => !query || doc.name.toLowerCase().includes(query))

  const columns: TableColumnsType<HrdDocument> = [
    {
      title: 'Document name',
      key: 'name',
      sorter: byText((doc) => doc.name),
      render: (_, doc) => (
        <button type="button" onClick={() => open(doc)} style={{ all: 'unset', cursor: 'pointer' }}>
          {doc.name}
        </button>
      ),
    },
    ...(tab === 'shared' ? [{ title: 'Owner', key: 'owner', width: 170, sorter: byText((doc) => doc.sharedBy ?? ''), render: (_: unknown, doc: HrdDocument) => doc.sharedBy }] : []),
    { title: 'Creation date', key: 'created', width: 150, sorter: byDate((doc) => doc.createdAt), render: (_, doc) => formatDate(doc.createdAt) },
    { title: 'Last modified', key: 'modified', width: 150, sorter: byDate((doc) => doc.modifiedAt), render: (_, doc) => formatDate(doc.modifiedAt) },
    // Left empty ("-" in every row), as in the Figma; the sort arrow stays to match it.
    { title: 'Archived', key: 'archived', width: 140, sorter: () => 0, render: () => '-' },
  ]

  return (
    <AppLayout>
      <div className="back-office-table" style={{ height: '100%', overflowY: 'auto', backgroundColor: colorPalette.neutral.lighten5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, minHeight: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography as="h1" size="heading-lg" weight="bold" color="neutral-darken5">
              Documents
            </Typography>
            <ButtonPrimary onClick={() => navigate(`${basePath}/new/${noEmployee ? 'template' : 'employee'}`)}>New document</ButtonPrimary>
          </div>

          <Tabs
            activeKey={tab}
            onChange={(key: string) => {
              setSearchParams(key === 'mine' ? {} : { tab: key })
              setSearch('')
            }}
            options={[
              { key: 'mine', label: TAB_TITLES.mine, content: null },
              { key: 'shared', label: TAB_TITLES.shared, content: null },
            ]}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderRadius: 16, backgroundColor: colorPalette.white }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Typography as="span" size="heading-md" weight="semibold">
                  {TAB_TITLES[tab]}
                </Typography>
              </div>
              <Toggle checked={bulkEdit} onChange={setBulkEdit}>
                Bulk edit
              </Toggle>
              <div style={{ width: 300 }}>
                <SearchBar placeholder="Search for document" variant={searchbarVariants.CONTRAST} value={search} onChange={setSearch} width="expanded" />
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
                description: query ? 'No documents match your search.' : tab === 'shared' ? 'No documents have been shared with you yet.' : 'No documents yet. Create one with New document.',
              }}
            />

            {/* The limit counts the user's own documents, not ones shared with them. */}
            {tab === 'mine' && <DocumentsCreated count={myDocuments.length} />}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
