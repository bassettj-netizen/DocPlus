import { useMemo, useState } from 'react'
import { constants, Segmented, toastPlacements, useNotifications } from '@goat-ui/goat-ui-core'
import { DOCUMENT_POOL, EMPTY_FILTERS, type Approver, type DocumentFilters } from './data'
import RequestApprovalPanel from './RequestApprovalPanel'
import AssignDocumentsPanel from './AssignDocumentsPanel'
import DocumentEditorHeader from './DocumentEditorHeader'
import DocumentEditorStatusBar from './DocumentEditorStatusBar'
import DocumentEditorSidebar from './DocumentEditorSidebar'
import DocumentMetadataCard from './DocumentMetadataCard'
import DocumentPreview from './DocumentPreview'

const { colorPalette } = constants

// Sampled from the Figma canvas behind the document pages — not one of the
// design system's named tokens.
const PREVIEW_CANVAS_COLOR = '#F2F4F6'

type PanelStep = 'closed' | 'request' | 'assign-documents'

export default function DocumentEditor() {
  const [panelStep, setPanelStep] = useState<PanelStep>('closed')
  const [approvers, setApprovers] = useState<Approver[]>([])
  const [sendToValue, setSendToValue] = useState('')
  const [isAddingApprover, setIsAddingApprover] = useState(false)
  const [message, setMessage] = useState('')
  const [expirationDate, setExpirationDate] = useState<Date>()

  const [activeApproverId, setActiveApproverId] = useState<string | null>(null)
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<DocumentFilters>(EMPTY_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')

  const activeApprover = approvers.find((approver) => approver.id === activeApproverId) ?? null

  const matchingDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return DOCUMENT_POOL.filter((doc) => {
      const matchesQuery = !query || doc.employeeName.toLowerCase().includes(query)
      const matchesPosition = filters.positions.length === 0 || filters.positions.includes(doc.position)
      const matchesOrganisation = filters.organisations.length === 0 || filters.organisations.includes(doc.organisation)
      return matchesQuery && matchesPosition && matchesOrganisation
    })
  }, [searchQuery, filters])

  const totalAssignedCount = useMemo(() => new Set(approvers.flatMap((approver) => approver.documentIds)).size, [approvers])

  const resetFlow = () => {
    setPanelStep('closed')
    setApprovers([])
    setSendToValue('')
    setIsAddingApprover(false)
    setMessage('')
    setExpirationDate(undefined)
    setActiveApproverId(null)
    setDraftSelectedIds([])
    setFilters(EMPTY_FILTERS)
    setSearchQuery('')
  }

  const handleAddApprover = () => {
    const email = sendToValue.trim()
    if (!email) return
    // A random id (generated outside the state updater) can't collide with
    // an existing approver — a module-level counter resets on hot reload
    // while state survives, which handed out duplicate ids.
    const id = crypto.randomUUID()
    setApprovers((prev) => [...prev, { id, email, documentIds: [] }])
    setSendToValue('')
    setIsAddingApprover(false)
  }

  const handleRemoveApprover = (approverId: string) => {
    setApprovers((prev) => prev.filter((approver) => approver.id !== approverId))
  }

  const handleOpenAssignDocuments = (approverId: string) => {
    const approver = approvers.find((a) => a.id === approverId)
    setActiveApproverId(approverId)
    setDraftSelectedIds(approver?.documentIds ?? [])
    setFilters(EMPTY_FILTERS)
    setSearchQuery('')
    setPanelStep('assign-documents')
  }

  const handleBackToRequest = () => {
    setPanelStep('request')
  }

  const handleDoneAssignDocuments = () => {
    setApprovers((prev) =>
      prev.map((approver) => (approver.id === activeApproverId ? { ...approver, documentIds: draftSelectedIds } : approver)),
    )
    setPanelStep('request')
  }

  // The tree reports which of the currently visible documents are checked;
  // selections hidden by the search/filters are left untouched.
  const handleChangeMatchingSelection = (checkedDocumentIds: string[]) => {
    const visibleIds = matchingDocuments.map((doc) => doc.id)
    setDraftSelectedIds((prev) => [...prev.filter((id) => !visibleIds.includes(id)), ...checkedDocumentIds])
  }

  const [view, setView] = useState<string | number>('Editor view')
  const { notification } = useNotifications()

  const handleSubmit = () => {
    resetFlow()
    notification.success({ title: 'Requests sent!', placement: toastPlacements.TOP_RIGHT })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colorPalette.white }}>
      <DocumentEditorHeader
        title="Fortbildungsvertrag mit Rückzahlungsklausel"
        onRequestApproval={() => {
          resetFlow()
          setPanelStep('request')
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
        visible={panelStep === 'request'}
        approvers={approvers}
        sendToValue={sendToValue}
        onSendToChange={setSendToValue}
        onAddApprover={handleAddApprover}
        isAddingApprover={isAddingApprover}
        onStartAddingApprover={() => setIsAddingApprover(true)}
        onCancelAddingApprover={() => {
          setIsAddingApprover(false)
          setSendToValue('')
        }}
        onRemoveApprover={handleRemoveApprover}
        message={message}
        onMessageChange={setMessage}
        expirationDate={expirationDate}
        onExpirationChange={(date) => setExpirationDate(date ?? undefined)}
        onOpenAssignDocuments={handleOpenAssignDocuments}
        totalAssignedCount={totalAssignedCount}
        totalDocumentCount={DOCUMENT_POOL.length}
        onClose={resetFlow}
        onSubmit={handleSubmit}
      />

      {activeApprover && (
        <AssignDocumentsPanel
          visible={panelStep === 'assign-documents'}
          approverEmail={activeApprover.email}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onChangePositions={(positions) => setFilters((prev) => ({ ...prev, positions }))}
          onChangeOrganisations={(organisations) => setFilters((prev) => ({ ...prev, organisations }))}
          matchingDocuments={matchingDocuments}
          totalDocumentCount={DOCUMENT_POOL.length}
          selectedIds={draftSelectedIds}
          onChangeMatchingSelection={handleChangeMatchingSelection}
          onBack={handleBackToRequest}
          onClose={resetFlow}
          onDone={handleDoneAssignDocuments}
        />
      )}
    </div>
  )
}
