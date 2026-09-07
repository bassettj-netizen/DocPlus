import { useMemo, useState } from 'react'
import { constants } from '@goat-ui/goat-ui-core'
import { DOCUMENT_TITLE, INITIAL_ASSIGNED_DOCUMENTS, type ApprovalStatus } from './data'
import ApprovalListPanel from './ApprovalListPanel'
import ApprovalHeader from './ApprovalHeader'
import DecisionBanner from './DecisionBanner'
import DecisionModal, { type PendingDecision } from './DecisionModal'
import DocumentPreview from './DocumentPreview'

const { colorPalette } = constants

// Sampled from the Figma canvas behind the document pages — not one of the
// design system's named tokens.
const PREVIEW_CANVAS_COLOR = '#F2F4F6'

export default function ApprovalsList() {
  const [documents, setDocuments] = useState(INITIAL_ASSIGNED_DOCUMENTS)
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? '')
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)

  const selectedDocument = useMemo(() => documents.find((doc) => doc.id === selectedId), [documents, selectedId])

  const setStatus = (id: string, status: ApprovalStatus) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, status } : doc)))
  }

  // Reject/Approve open the confirmation modal rather than deciding right
  // away. With documents checked, it targets that whole batch; with nothing
  // checked it falls back to just the currently open document.
  const requestDecision = (status: Exclude<ApprovalStatus, 'pending'>) => {
    const count = checkedIds.size > 0 ? checkedIds.size : selectedDocument ? 1 : 0
    if (count === 0) return
    setPendingDecision({ status, count })
  }

  const confirmDecision = () => {
    if (!pendingDecision) return
    const { status } = pendingDecision
    if (checkedIds.size > 0) {
      setDocuments((prev) => prev.map((doc) => (checkedIds.has(doc.id) ? { ...doc, status } : doc)))
      setCheckedIds(new Set())
    } else if (selectedDocument) {
      setStatus(selectedDocument.id, status)
    }
    setPendingDecision(null)
  }

  const handleToggleChecked = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleAllChecked = () => {
    setCheckedIds((prev) => (prev.size === documents.length ? new Set() : new Set(documents.map((doc) => doc.id))))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colorPalette.white }}>
      <ApprovalHeader
        title={DOCUMENT_TITLE}
        disabled={checkedIds.size > 0 ? false : selectedDocument?.status !== 'pending'}
        selectedCount={checkedIds.size}
        onReject={() => requestDecision('rejected')}
        onApprove={() => requestDecision('approved')}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ApprovalListPanel
          documents={documents}
          selectedId={selectedId}
          onSelect={setSelectedId}
          checkedIds={checkedIds}
          onToggleChecked={handleToggleChecked}
          onToggleAllChecked={handleToggleAllChecked}
        />

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {selectedDocument && selectedDocument.status !== 'pending' && (
            <DecisionBanner status={selectedDocument.status} onUndo={() => setStatus(selectedDocument.id, 'pending')} />
          )}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: 40,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: PREVIEW_CANVAS_COLOR,
            }}
          >
            {selectedDocument && <DocumentPreview employeeName={selectedDocument.employeeName} />}
          </div>
        </div>
      </div>

      <DecisionModal pending={pendingDecision} onCancel={() => setPendingDecision(null)} onConfirm={confirmDecision} />
    </div>
  )
}
