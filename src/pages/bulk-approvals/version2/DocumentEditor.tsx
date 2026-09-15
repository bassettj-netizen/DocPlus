import { useMemo, useState } from 'react'
import { constants, Segmented } from '@goat-ui/goat-ui-core'
import { DOCUMENT_POOL, ORGANISATION_OPTIONS, POSITION_OPTIONS, type Approver } from './data'
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

const ALL = 'All'
const POSITION_VALUES = POSITION_OPTIONS.map((option) => option.value)
const ORGANISATION_VALUES = ORGANISATION_OPTIONS.map((option) => option.value)

type PanelStep = 'closed' | 'request' | 'assign-documents'

let nextApproverId = 1

export default function DocumentEditor() {
  const [panelStep, setPanelStep] = useState<PanelStep>('closed')
  const [approvers, setApprovers] = useState<Approver[]>([])
  const [sendToValue, setSendToValue] = useState('')
  const [message, setMessage] = useState('')
  const [expirationDate, setExpirationDate] = useState<Date>()

  const [activeApproverId, setActiveApproverId] = useState<string | null>(null)
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>([])
  const [positionFilter, setPositionFilter] = useState(ALL)
  const [organisationFilter, setOrganisationFilter] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')

  const activeApprover = approvers.find((approver) => approver.id === activeApproverId) ?? null

  const matchingDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return DOCUMENT_POOL.filter((doc) => {
      const matchesQuery = !query || doc.employeeName.toLowerCase().includes(query)
      const matchesPosition = positionFilter === ALL || doc.position === positionFilter
      const matchesOrganisation = organisationFilter === ALL || doc.organisation === organisationFilter
      return matchesQuery && matchesPosition && matchesOrganisation
    })
  }, [searchQuery, positionFilter, organisationFilter])

  const totalAssignedCount = useMemo(() => new Set(approvers.flatMap((approver) => approver.documentIds)).size, [approvers])

  // A document can only be assigned to one approver — anything already
  // committed to a different approver is off-limits here.
  const disabledDocumentIds = useMemo(
    () =>
      new Set(
        approvers.filter((approver) => approver.id !== activeApproverId).flatMap((approver) => approver.documentIds),
      ),
    [approvers, activeApproverId],
  )

  const resetFlow = () => {
    setPanelStep('closed')
    setApprovers([])
    setSendToValue('')
    setMessage('')
    setExpirationDate(undefined)
    setActiveApproverId(null)
    setDraftSelectedIds([])
    setPositionFilter(ALL)
    setOrganisationFilter(ALL)
    setSearchQuery('')
  }

  const handleAddApprover = () => {
    const email = sendToValue.trim()
    if (!email) return
    setApprovers((prev) => [...prev, { id: String(nextApproverId++), email, documentIds: [] }])
    setSendToValue('')
  }

  const handleRemoveApprover = (approverId: string) => {
    setApprovers((prev) => prev.filter((approver) => approver.id !== approverId))
  }

  const handleOpenAssignDocuments = (approverId: string) => {
    const approver = approvers.find((a) => a.id === approverId)
    setActiveApproverId(approverId)
    setDraftSelectedIds(approver?.documentIds ?? [])
    setPositionFilter(ALL)
    setOrganisationFilter(ALL)
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

  const handleToggleDocument = (id: string) => {
    setDraftSelectedIds((prev) => (prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]))
  }

  const handleToggleSelectAllMatching = () => {
    const selectableIds = matchingDocuments.filter((doc) => !disabledDocumentIds.has(doc.id)).map((doc) => doc.id)
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => draftSelectedIds.includes(id))
    setDraftSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !selectableIds.includes(id)) : Array.from(new Set([...prev, ...selectableIds])),
    )
  }

  const [view, setView] = useState<string | number>('Editor view')

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
        onRemoveApprover={handleRemoveApprover}
        message={message}
        onMessageChange={setMessage}
        expirationDate={expirationDate}
        onExpirationChange={(date) => setExpirationDate(date ?? undefined)}
        onOpenAssignDocuments={handleOpenAssignDocuments}
        totalAssignedCount={totalAssignedCount}
        totalDocumentCount={DOCUMENT_POOL.length}
        onClose={resetFlow}
        onSubmit={resetFlow}
      />

      {activeApprover && (
        <AssignDocumentsPanel
          visible={panelStep === 'assign-documents'}
          approverEmail={activeApprover.email}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          positionOptions={POSITION_VALUES}
          organisationOptions={ORGANISATION_VALUES}
          positionFilter={positionFilter}
          organisationFilter={organisationFilter}
          onChangePositionFilter={setPositionFilter}
          onChangeOrganisationFilter={setOrganisationFilter}
          matchingDocuments={matchingDocuments}
          disabledDocumentIds={disabledDocumentIds}
          totalDocumentCount={DOCUMENT_POOL.length}
          selectedIds={draftSelectedIds}
          onToggleDocument={handleToggleDocument}
          onToggleSelectAllMatching={handleToggleSelectAllMatching}
          onBack={handleBackToRequest}
          onClose={resetFlow}
          onDone={handleDoneAssignDocuments}
        />
      )}
    </div>
  )
}
