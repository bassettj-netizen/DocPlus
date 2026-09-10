import {
  ButtonPrimary,
  ButtonTertiary,
  Checkbox,
  Chip,
  chipStyles,
  chipVariants,
  Collapsible,
  constants,
  DatePicker,
  Input,
  Panel,
  SearchBar,
  TextArea,
  Typography,
} from '@goat-ui/goat-ui-core'
import type { Approver, DocumentRecord } from './data'
import PanelHeader from './PanelHeader'

const { colorPalette } = constants
const EMAIL_PATTERN = /\S+@\S+\.\S+/
const ALL = 'All'

interface FilterChipRowProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

function FilterChipRow({ label, options, value, onChange }: FilterChipRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 200 }}>
      <Typography size="base-sm" color="neutral-darken2">
        {label}
      </Typography>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[ALL, ...options].map((option) => (
          <Chip
            key={option}
            label={option}
            uppercase
            chipStyle={chipStyles.ACCENT_NEUTRAL}
            variant={option === value ? chipVariants.HIGHLIGHT : chipVariants.SUBTLE}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  )
}

interface RequestApprovalPanelProps {
  visible: boolean
  approvers: Approver[]
  expandedApproverId: string | null
  onExpandedApproverChange: (id: string | null) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  positionOptions: string[]
  organisationOptions: string[]
  positionFilter: string
  organisationFilter: string
  onChangePositionFilter: (value: string) => void
  onChangeOrganisationFilter: (value: string) => void
  matchingDocuments: DocumentRecord[]
  disabledDocumentIds: Set<string>
  onToggleDocument: (id: string) => void
  onToggleSelectAllMatching: () => void
  sendToValue: string
  onSendToChange: (value: string) => void
  onAddApprover: () => void
  message: string
  onMessageChange: (value: string) => void
  expirationDate: Date | undefined
  onExpirationChange: (date: Date | null) => void
  totalAssignedCount: number
  totalDocumentCount: number
  onClose: () => void
  onSubmit: () => void
}

export default function RequestApprovalPanel({
  visible,
  approvers,
  expandedApproverId,
  onExpandedApproverChange,
  searchQuery,
  onSearchChange,
  positionOptions,
  organisationOptions,
  positionFilter,
  organisationFilter,
  onChangePositionFilter,
  onChangeOrganisationFilter,
  matchingDocuments,
  disabledDocumentIds,
  onToggleDocument,
  onToggleSelectAllMatching,
  sendToValue,
  onSendToChange,
  onAddApprover,
  message,
  onMessageChange,
  expirationDate,
  onExpirationChange,
  totalAssignedCount,
  totalDocumentCount,
  onClose,
  onSubmit,
}: RequestApprovalPanelProps) {
  const canSend = approvers.length > 0 && !!expirationDate

  const selectableMatchingDocuments = matchingDocuments.filter((doc) => !disabledDocumentIds.has(doc.id))
  const activeApprover = approvers.find((approver) => approver.id === expandedApproverId)
  const selectedIds = activeApprover?.documentIds ?? []
  const allMatchingSelected =
    selectableMatchingDocuments.length > 0 && selectableMatchingDocuments.every((doc) => selectedIds.includes(doc.id))
  const someMatchingSelected = selectableMatchingDocuments.some((doc) => selectedIds.includes(doc.id))

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      title={<PanelHeader title="Request approval" onClose={onClose} />}
      footer={{
        divider: true,
        content: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <ButtonTertiary onClick={onClose}>Cancel</ButtonTertiary>
            <ButtonPrimary disabled={!canSend} onClick={onSubmit}>
              Send request
            </ButtonPrimary>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 8px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography size="base-lg" weight="semibold">
                {approvers.length > 0 ? `Approvers (${approvers.length})` : 'Approvers'}
              </Typography>
              <Typography size="base-sm" color="neutral-darken2">
                {totalAssignedCount} / {totalDocumentCount} documents assigned
              </Typography>
            </div>

            {approvers.length > 0 && (
              <div className="approvers-collapsible">
                {/* The design system's .goat-collapse-header uses align-items:
                    flex-start, which top-aligns our header content against the
                    full-height expand arrow instead of centering it. */}
                <style>{`.approvers-collapsible .goat-collapse-header { align-items: center !important; }`}</style>
                <Collapsible
                  activeKey={expandedApproverId ? [expandedApproverId] : []}
                  onChange={(key) => {
                    const keys = Array.isArray(key) ? key : [key]
                    const nextKey = keys.find((k) => k !== expandedApproverId) ?? null
                    onExpandedApproverChange(nextKey)
                  }}
                  items={approvers.map((approver) => ({
                    key: approver.id,
                    header: (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography>{approver.email}</Typography>
                        <Chip
                          label={`${approver.documentIds.length} document${approver.documentIds.length === 1 ? '' : 's'} assigned`}
                          uppercase
                          chipStyle={chipStyles.ACCENT_NEUTRAL}
                          variant={chipVariants.SUBTLE}
                        />
                      </div>
                    ),
                    children:
                      expandedApproverId === approver.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <SearchBar
                            placeholder="Search for document"
                            value={searchQuery}
                            onChange={onSearchChange}
                            width="expanded"
                          />

                          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                            <FilterChipRow
                              label="Position:"
                              options={positionOptions}
                              value={positionFilter}
                              onChange={onChangePositionFilter}
                            />
                            <FilterChipRow
                              label="Organisation:"
                              options={organisationOptions}
                              value={organisationFilter}
                              onChange={onChangeOrganisationFilter}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div
                              style={{
                                borderTop: `1px solid ${colorPalette.neutral.lighten2}`,
                                borderBottom: `1px solid ${colorPalette.neutral.lighten2}`,
                                padding: '8px 4px',
                              }}
                            >
                              <Checkbox
                                checked={allMatchingSelected}
                                indeterminate={!allMatchingSelected && someMatchingSelected}
                                onChange={onToggleSelectAllMatching}
                                disabled={matchingDocuments.length === 0}
                              >
                                {`Select ${matchingDocuments.length} matching document${matchingDocuments.length === 1 ? '' : 's'}`}
                              </Checkbox>
                            </div>

                            {matchingDocuments.length === 0 ? (
                              <div style={{ padding: '16px 4px' }}>
                                <Typography color="neutral-darken2">No documents match your search.</Typography>
                              </div>
                            ) : (
                              matchingDocuments.map((doc) => {
                                const isDisabled = disabledDocumentIds.has(doc.id)
                                return (
                                  <div
                                    key={doc.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '8px 4px',
                                      borderBottom: `1px solid ${colorPalette.neutral.lighten2}`,
                                      backgroundColor: isDisabled ? colorPalette.disabled.lighten5 : undefined,
                                    }}
                                  >
                                    <Checkbox
                                      checked={!isDisabled && selectedIds.includes(doc.id)}
                                      disabled={isDisabled}
                                      onChange={() => onToggleDocument(doc.id)}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography weight="semibold" color={isDisabled ? 'disabled-base' : undefined}>
                                          {doc.employeeName}
                                        </Typography>
                                        <Typography size="base-sm" color={isDisabled ? 'disabled-base' : 'neutral-darken2'}>
                                          {isDisabled
                                            ? 'Already assigned to another approver'
                                            : `${doc.position} • ${doc.organisation}`}
                                        </Typography>
                                      </div>
                                    </Checkbox>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>
                      ) : null,
                  }))}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <Input
                  name="send-to"
                  label="Send to"
                  isRequired
                  placeholder="Insert email"
                  value={sendToValue}
                  onChange={(event) => onSendToChange(event.target.value)}
                  onPressEnter={() => {
                    if (EMAIL_PATTERN.test(sendToValue.trim())) onAddApprover()
                  }}
                  helper="Anyone with access to this email will be able to open the link"
                />
              </div>
              {sendToValue.trim() && (
                <div style={{ paddingTop: 24 }}>
                  <ButtonPrimary disabled={!EMAIL_PATTERN.test(sendToValue.trim())} onClick={onAddApprover}>
                    Add
                  </ButtonPrimary>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextArea
              name="message"
              label="Message"
              placeholder="Insert text"
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
            />
            <DatePicker
              name="expiration-date"
              label="Expiration date"
              isRequired
              description="Set until when this document will be accessible by others."
              placeholder="DD/MM/YYYY"
              value={expirationDate}
              onChange={onExpirationChange}
              helper="Valid until 23:59h CET of the selected day."
              disablePastDates
            />
          </div>
        </div>
      </div>
    </Panel>
  )
}
