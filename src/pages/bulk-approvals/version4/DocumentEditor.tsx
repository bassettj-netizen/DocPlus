import { useMemo, useState } from 'react'
import { constants, Segmented } from '@goat-ui/goat-ui-core'
import { DOCUMENT_POOL, type Approver } from './data'
import RequestApprovalPanel from './RequestApprovalPanel'
import DocumentEditorHeader from './DocumentEditorHeader'
import DocumentEditorStatusBar from './DocumentEditorStatusBar'
import DocumentEditorSidebar from './DocumentEditorSidebar'
import DocumentMetadataCard from './DocumentMetadataCard'
import DocumentPreview from './DocumentPreview'

const { colorPalette } = constants

// Sampled from the Figma canvas behind the document pages — not one of the
// design system's named tokens.
const PREVIEW_CANVAS_COLOR = '#F2F4F6'

let nextApproverId = 1

const makeEmptyApprover = (): Approver => ({ id: String(nextApproverId++), email: '', documentIds: [] })

export default function DocumentEditor() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [approvers, setApprovers] = useState<Approver[]>([])
  const [message, setMessage] = useState('')
  const [expirationDate, setExpirationDate] = useState<Date>()

  const totalAssignedCount = useMemo(
    () => new Set(approvers.flatMap((approver) => approver.documentIds)).size,
    [approvers],
  )

  const resetFlow = () => {
    setPanelOpen(false)
    setApprovers([])
    setMessage('')
    setExpirationDate(undefined)
  }

  const handleAddApprover = () => {
    setApprovers((prev) => [...prev, makeEmptyApprover()])
  }

  const handleUpdateApproverEmail = (approverId: string, email: string) => {
    setApprovers((prev) => prev.map((approver) => (approver.id === approverId ? { ...approver, email } : approver)))
  }

  const handleUpdateApproverDocuments = (approverId: string, ids: string[]) => {
    setApprovers((prev) => prev.map((approver) => (approver.id === approverId ? { ...approver, documentIds: ids } : approver)))
  }

  const handleRemoveApprover = (approverId: string) => {
    setApprovers((prev) => prev.filter((approver) => approver.id !== approverId))
  }

  const [view, setView] = useState<string | number>('Editor view')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colorPalette.white }}>
      <DocumentEditorHeader
        title="Fortbildungsvertrag mit Rückzahlungsklausel"
        onRequestApproval={() => {
          resetFlow()
          setApprovers([makeEmptyApprover()])
          setPanelOpen(true)
        }}
      />

      <DocumentEditorStatusBar />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flexShrink: 0 }}>
          <DocumentEditorSidebar />
        </div>

        <div style={{ width: 440, flexShrink: 0, minHeight: 0 }}>
          <DocumentMetadataCard />
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', flexShrink: 0, backgroundColor: PREVIEW_CANVAS_COLOR }}>
            <Segmented options={['Editor view', 'PDF preview']} value={view} onChange={setView} />
          </div>

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
            <DocumentPreview />
          </div>
        </div>
      </div>

      <RequestApprovalPanel
        visible={panelOpen}
        approvers={approvers}
        onUpdateApproverEmail={handleUpdateApproverEmail}
        onUpdateApproverDocuments={handleUpdateApproverDocuments}
        onRemoveApprover={handleRemoveApprover}
        onAddApprover={handleAddApprover}
        message={message}
        onMessageChange={setMessage}
        expirationDate={expirationDate}
        onExpirationChange={(date) => setExpirationDate(date ?? undefined)}
        totalAssignedCount={totalAssignedCount}
        totalDocumentCount={DOCUMENT_POOL.length}
        onClose={resetFlow}
        onSubmit={resetFlow}
      />
    </div>
  )
}
