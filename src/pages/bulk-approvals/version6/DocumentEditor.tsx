import { useMemo, useState } from 'react'
import { constants, Segmented } from '@goat-ui/goat-ui-core'
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

let nextApproverId = 1

export default function DocumentEditor() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [approvers, setApprovers] = useState<Approver[]>([])
  const [sendToValue, setSendToValue] = useState('')
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

  // A document can only be assigned to one approver — anything already
  // committed to a different approver is off-limits here.
  const disabledDocumentIds = useMemo(
    () =>
      new Set(
        approvers.filter((approver) => approver.id !== expandedApproverId).flatMap((approver) => approver.documentIds),
      ),
    [approvers, expandedApproverId],
  )

  const resetFlow = () => {
    setPanelOpen(false)
    setApprovers([])
    setSendToValue('')
    setMessage('')
    setExpirationDate(undefined)
    setExpandedApproverId(null)
    setFilters(EMPTY_FILTERS)
    setSearchQuery('')
  }

  const handleAddApprover = () => {
    const email = sendToValue.trim()
    if (!email) return
    setApprovers((prev) => [...prev, { id: String(nextApproverId++), email, documentIds: [] }])
    setSendToValue('')
  }

  const handleExpandedApproverChange = (id: string | null) => {
    setExpandedApproverId(id)
    setFilters(EMPTY_FILTERS)
    setSearchQuery('')
  }

  const handleToggleDocument = (id: string) => {
    if (!expandedApproverId) return
    setApprovers((prev) =>
      prev.map((approver) =>
        approver.id === expandedApproverId
          ? {
              ...approver,
              documentIds: approver.documentIds.includes(id)
                ? approver.documentIds.filter((docId) => docId !== id)
                : [...approver.documentIds, id],
            }
          : approver,
      ),
    )
  }

  const handleToggleSelectAllMatching = () => {
    if (!expandedApproverId) return
    const selectableIds = matchingDocuments.filter((doc) => !disabledDocumentIds.has(doc.id)).map((doc) => doc.id)
    setApprovers((prev) =>
      prev.map((approver) => {
        if (approver.id !== expandedApproverId) return approver
        const allSelected = selectableIds.length > 0 && selectableIds.every((id) => approver.documentIds.includes(id))
        const documentIds = allSelected
          ? approver.documentIds.filter((id) => !selectableIds.includes(id))
          : Array.from(new Set([...approver.documentIds, ...selectableIds]))
        return { ...approver, documentIds }
      }),
    )
  }

  const [view, setView] = useState<string | number>('Editor view')

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
        disabledDocumentIds={disabledDocumentIds}
        onToggleDocument={handleToggleDocument}
        onToggleSelectAllMatching={handleToggleSelectAllMatching}
        sendToValue={sendToValue}
        onSendToChange={setSendToValue}
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
