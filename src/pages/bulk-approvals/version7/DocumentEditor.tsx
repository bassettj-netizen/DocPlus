import { useMemo, useState } from 'react'
import { constants, Segmented, toastPlacements, useNotifications } from '@goat-ui/goat-ui-core'
import { DOCUMENT_POOL, EMPTY_FILTERS, ORGANISATION_OPTIONS, POSITION_OPTIONS, type Approver, type DocumentFilters } from './data'
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

export default function DocumentEditor() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [approvers, setApprovers] = useState<Approver[]>([])
  const [sendToValue, setSendToValue] = useState('')
  const [isAddingApprover, setIsAddingApprover] = useState(false)
  const [message, setMessage] = useState('')
  const [expirationDate, setExpirationDate] = useState<Date>()

  const [expandedApproverId, setExpandedApproverId] = useState<string | null>(null)
  const [filters, setFilters] = useState<DocumentFilters>(EMPTY_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')

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
    setPanelOpen(false)
    setApprovers([])
    setSendToValue('')
    setIsAddingApprover(false)
    setMessage('')
    setExpirationDate(undefined)
    setExpandedApproverId(null)
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
    if (expandedApproverId === approverId) handleExpandedApproverChange(null)
  }

  const handleExpandedApproverChange = (id: string | null) => {
    setExpandedApproverId(id)
    setFilters(EMPTY_FILTERS)
    setSearchQuery('')
  }

  // The tree reports which of the currently visible documents are checked;
  // selections hidden by the search/filters are left untouched.
  const handleChangeMatchingSelection = (checkedDocumentIds: string[]) => {
    if (!expandedApproverId) return
    const visibleIds = matchingDocuments.map((doc) => doc.id)
    setApprovers((prev) =>
      prev.map((approver) =>
        approver.id === expandedApproverId
          ? {
              ...approver,
              documentIds: [...approver.documentIds.filter((id) => !visibleIds.includes(id)), ...checkedDocumentIds],
            }
          : approver,
      ),
    )
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
        expandedApproverId={expandedApproverId}
        onExpandedApproverChange={handleExpandedApproverChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        positionOptions={POSITION_OPTIONS}
        organisationOptions={ORGANISATION_OPTIONS}
        filters={filters}
        onChangePositions={(positions) => setFilters((prev) => ({ ...prev, positions }))}
        onChangeOrganisations={(organisations) => setFilters((prev) => ({ ...prev, organisations }))}
        matchingDocuments={matchingDocuments}
        onChangeMatchingSelection={handleChangeMatchingSelection}
        isAddingApprover={isAddingApprover}
        onStartAddingApprover={() => setIsAddingApprover(true)}
        onCancelAddingApprover={() => {
          setIsAddingApprover(false)
          setSendToValue('')
        }}
        sendToValue={sendToValue}
        onSendToChange={setSendToValue}
        onAddApprover={handleAddApprover}
        onRemoveApprover={handleRemoveApprover}
        message={message}
        onMessageChange={setMessage}
        expirationDate={expirationDate}
        onExpirationChange={(date) => setExpirationDate(date ?? undefined)}
        totalAssignedCount={totalAssignedCount}
        totalDocumentCount={DOCUMENT_POOL.length}
        onClose={resetFlow}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
