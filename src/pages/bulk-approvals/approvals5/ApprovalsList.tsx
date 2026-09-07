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
  const [openId, setOpenId] = useState(documents[0]?.id ?? '')
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)

  const openDocument = useMemo(() => documents.find((doc) => doc.id === openId), [documents, openId])

  const setStatus = (id: string, status: ApprovalStatus) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, status } : doc)))
  }

  // A single document's own row Reject/Approve act on just that document —
  // never on whatever else happens to be checked elsewhere.
  const requestRowDecision = (id: string, status: Exclude<ApprovalStatus, 'pending'>) => {
    const doc = documents.find((d) => d.id === id)
    if (!doc) return
    setPendingDecision({ status, documents: [{ id: doc.id, employeeName: doc.employeeName }] })
  }

  // The list panel's own bulk bar (only visible once something is checked)
  // acts on exactly the checked set — a separate control, not a fallback.
  const requestBulkDecision = (status: Exclude<ApprovalStatus, 'pending'>) => {
    if (checkedIds.size === 0) return
    const affected = documents.filter((doc) => checkedIds.has(doc.id)).map((doc) => ({ id: doc.id, employeeName: doc.employeeName }))
    setPendingDecision({ status, documents: affected })
  }

  const confirmDecision = () => {
    if (!pendingDecision) return
    const { status, documents: affected } = pendingDecision
    const affectedIds = new Set(affected.map((doc) => doc.id))
    setDocuments((prev) => prev.map((doc) => (affectedIds.has(doc.id) ? { ...doc, status } : doc)))
    setCheckedIds((prev) => {
      const next = new Set(prev)
      affectedIds.forEach((id) => next.delete(id))
      return next
    })
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
    const pendingIds = documents.filter((doc) => doc.status === 'pending').map((doc) => doc.id)
    setCheckedIds((prev) => (pendingIds.every((id) => prev.has(id)) ? new Set() : new Set(pendingIds)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colorPalette.white }}>
      <ApprovalHeader title={DOCUMENT_TITLE} />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <ApprovalListPanel
          documents={documents}
          openId={openId}
          onOpen={setOpenId}
          checkedIds={checkedIds}
          onToggleChecked={handleToggleChecked}
          onToggleAllChecked={handleToggleAllChecked}
          onBulkReject={() => requestBulkDecision('rejected')}
          onBulkApprove={() => requestBulkDecision('approved')}
          onRowReject={(id) => requestRowDecision(id, 'rejected')}
          onRowApprove={(id) => requestRowDecision(id, 'approved')}
        />

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {openDocument && openDocument.status !== 'pending' && (
            <DecisionBanner status={openDocument.status} onUndo={() => setStatus(openDocument.id, 'pending')} />
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
            {openDocument && <DocumentPreview employeeName={openDocument.employeeName} />}
          </div>
        </div>
      </div>

      <DecisionModal pending={pendingDecision} onCancel={() => setPendingDecision(null)} onConfirm={confirmDecision} />
    </div>
  )
}
