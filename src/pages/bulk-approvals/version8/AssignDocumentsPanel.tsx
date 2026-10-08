import { useState, type Key } from 'react'
import { ButtonPrimary, ButtonTertiary, Panel, SearchBar, Select, Tree, Typography } from '@goat-ui/goat-ui-core'
import type { TreeItem } from '@goat-ui/goat-ui-core'
import { ORGANISATION_OPTIONS, POSITION_OPTIONS, type DocumentFilters, type DocumentRecord } from './data'
import PanelHeader from './PanelHeader'

const ROOT_KEY = 'all'
const DOCUMENT_KEY_PREFIX = 'doc:'

interface AssignDocumentsPanelProps {
  visible: boolean
  approverEmail: string
  searchQuery: string
  onSearchChange: (value: string) => void
  filters: DocumentFilters
  onChangePositions: (positions: string[]) => void
  onChangeOrganisations: (organisations: string[]) => void
  matchingDocuments: DocumentRecord[]
  totalDocumentCount: number
  selectedIds: string[]
  onChangeMatchingSelection: (checkedDocumentIds: string[]) => void
  onBack: () => void
  onClose: () => void
  onDone: () => void
}

export default function AssignDocumentsPanel({
  visible,
  approverEmail,
  searchQuery,
  onSearchChange,
  filters,
  onChangePositions,
  onChangeOrganisations,
  matchingDocuments,
  totalDocumentCount,
  selectedIds,
  onChangeMatchingSelection,
  onBack,
  onClose,
  onDone,
}: AssignDocumentsPanelProps) {
  const [isTreeExpanded, setIsTreeExpanded] = useState(true)

  // A single "All matching documents" parent lets every match be checked
  // in one click.
  const treeItems: TreeItem[] = [
    {
      key: ROOT_KEY,
      title: <Typography weight="semibold">{`All matching documents (${matchingDocuments.length})`}</Typography>,
      children: matchingDocuments.map((doc) => ({
        key: DOCUMENT_KEY_PREFIX + doc.id,
        title: (
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
            <Typography>{doc.employeeName}</Typography>
            <Typography size="base-sm" color="neutral-darken2">
              {`${doc.position} • ${doc.organisation}`}
            </Typography>
          </span>
        ),
      })),
    },
  ]

  const checkedKeys = matchingDocuments
    .filter((doc) => selectedIds.includes(doc.id))
    .map((doc) => DOCUMENT_KEY_PREFIX + doc.id)

  const handleCheck = (checked: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    const keys = Array.isArray(checked) ? checked : checked.checked
    const documentIds = keys
      .map(String)
      .filter((key) => key.startsWith(DOCUMENT_KEY_PREFIX))
      .map((key) => key.slice(DOCUMENT_KEY_PREFIX.length))
    onChangeMatchingSelection(documentIds)
  }

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      title={<PanelHeader title="Assign documents" onBack={onBack} onClose={onClose} />}
      footer={{
        divider: true,
        content: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <ButtonTertiary onClick={onBack}>Cancel</ButtonTertiary>
            <ButtonPrimary onClick={onDone}>Assign</ButtonPrimary>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 8px', height: '100%', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography size="base-sm" color="neutral-darken2">
            Recipient:
          </Typography>
          <Typography weight="semibold">{approverEmail}</Typography>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, flex: 1 }}>
          <SearchBar placeholder="Search for document" value={searchQuery} onChange={onSearchChange} width="expanded" />

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Select
                name="position"
                label="Position"
                placeholder="All positions"
                multiple
                options={POSITION_OPTIONS}
                value={filters.positions}
                onChange={(value) => onChangePositions(value as string[])}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Select
                name="organisation"
                label="Organisation"
                placeholder="All organisations"
                multiple
                options={ORGANISATION_OPTIONS}
                value={filters.organisations}
                onChange={(value) => onChangeOrganisations(value as string[])}
              />
            </div>
          </div>

          {matchingDocuments.length === 0 ? (
            <div style={{ padding: '16px 4px' }}>
              <Typography color="neutral-darken2">No documents match your search.</Typography>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <Tree
                checkable
                selectable={false}
                items={treeItems}
                checkedKeys={checkedKeys}
                expandedKeys={isTreeExpanded ? [ROOT_KEY] : []}
                onExpand={(keys) => setIsTreeExpanded(keys.includes(ROOT_KEY))}
                onCheck={handleCheck}
              />
            </div>
          )}

          <Typography size="base-sm" color="neutral-darken2">
            {selectedIds.length} of {totalDocumentCount} documents selected
          </Typography>
        </div>
      </div>
    </Panel>
  )
}
