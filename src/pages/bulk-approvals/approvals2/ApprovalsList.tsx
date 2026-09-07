import { useMemo, useState } from 'react'
import { constants, Typography } from '@goat-ui/goat-ui-core'
import { DOCUMENT_TITLE, INITIAL_ASSIGNED_DOCUMENTS, type ApprovalStatus } from './data'
import ApprovalListPanel from './ApprovalListPanel'
import ApprovalHeader from './ApprovalHeader'
import BatchSelectionSummary from './BatchSelectionSummary'
import DecisionBanner from './DecisionBanner'
import DecisionModal, { type PendingDecision } from './DecisionModal'
import DocumentPreview from './DocumentPreview'

const { colorPalette } = constants

// Sampled from the Figma canvas behind the document pages — not one of the
// design system's named tokens.
const PREVIEW_CANVAS_COLOR = '#F2F4F6'

export default function ApprovalsList() {
  const [documents, setDocuments] = useState(INITIAL_ASSIGNED_DOCUMENTS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const firstId = INITIAL_ASSIGNED_DOCUMENTS[0]?.id
    return firstId ? new Set([firstId]) : new Set()
  })
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)

  const selectedDocuments = useMemo(
    () => documents.filter((doc) => selectedIds.has(doc.id)),
    [documents, selectedIds],
  )
  const isBatch = selectedIds.size > 1
  const soleDocument = selectedIds.size === 1 ? selectedDocuments[0] : undefined

  const setStatus = (id: string, status: ApprovalStatus) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, status } : doc)))
  }

  // Clicking a row's body always narrows the selection down to just that
  // row — the everyday "open one, decide on it" path. The checkbox (or
  // status icon once decided) is the only way to grow a batch.
  const handleOpenOnly = (id: string) => setSelectedIds(new Set([id]))

  const handleToggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleAllSelected = () => {
    setSelectedIds((prev) => (prev.size === documents.length ? new Set() : new Set(documents.map((doc) => doc.id))))
  }

  const requestDecision = (status: Exclude<ApprovalStatus, 'pending'>) => {
    if (selectedIds.size === 0) return
    setPendingDecision({ status, count: selectedIds.size })
  }

  const confirmDecision = () => {
    if (!pendingDecision) return
    const { status } = pendingDecision
    setDocuments((prev) => prev.map((doc) => (selectedIds.has(doc.id) ? { ...doc, status } : doc)))
    setPendingDecision(null)
  }

  const title = isBatch ? `${selectedIds.size} documents selected` : selectedIds.size === 1 ? DOCUMENT_TITLE : 'No document selected'
  const headerDisabled = selectedIds.size === 0 ? true : isBatch ? false : soleDocument?.status !== 'pending'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colorPalette.white }}>
      <ApprovalHeader
        title={title}
        disabled={headerDisabled}
        selectedCount={isBatch ? selectedIds.size : 0}
        onReject={() => requestDecision('rejected')}
        onApprove={() => requestDecision('approved')}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ApprovalListPanel
          documents={documents}
          selectedIds={selectedIds}
          onOpenOnly={handleOpenOnly}
          onToggleSelected={handleToggleSelected}
          onToggleAllSelected={handleToggleAllSelected}
        />

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {!isBatch && soleDocument && soleDocument.status !== 'pending' && (
            <DecisionBanner status={soleDocument.status} onUndo={() => setStatus(soleDocument.id, 'pending')} />
          )}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: 40,
              display: 'flex',
              justifyContent: 'center',
              alignItems: isBatch ? 'flex-start' : undefined,
              backgroundColor: PREVIEW_CANVAS_COLOR,
            }}
          >
            {isBatch && <BatchSelectionSummary documents={selectedDocuments} onUndo={(id) => setStatus(id, 'pending')} />}
            {!isBatch && soleDocument && <DocumentPreview employeeName={soleDocument.employeeName} />}
            {!isBatch && !soleDocument && (
              <Typography color="neutral-darken2">Select a document from the list to review it.</Typography>
            )}
          </div>
        </div>
      </div>

      <DecisionModal pending={pendingDecision} onCancel={() => setPendingDecision(null)} onConfirm={confirmDecision} />
    </div>
  )
}
