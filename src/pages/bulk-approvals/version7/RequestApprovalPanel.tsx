import { useState, type Key } from 'react'
import {
  ButtonDashed,
  ButtonGhost,
  ButtonPrimary,
  ButtonTertiary,
  Chip,
  chipStyles,
  chipVariants,
  Collapsible,
  DatePicker,
  Icon,
  iconType,
  Input,
  Panel,
  SearchBar,
  Select,
  TextArea,
  Tree,
  Typography,
} from '@goat-ui/goat-ui-core'
import type { TreeItem } from '@goat-ui/goat-ui-core'
import type { Approver, DocumentFilters, DocumentRecord } from './data'
import PanelHeader from './PanelHeader'

const EMAIL_PATTERN = /\S+@\S+\.\S+/
// Roughly 10 tree rows before the tree scrolls inside the collapsible.
const DOCUMENT_TREE_MAX_HEIGHT = 320
const ROOT_KEY = 'all'
const DOCUMENT_KEY_PREFIX = 'doc:'

interface SelectOption {
  label: string
  value: string
}

interface RequestApprovalPanelProps {
  visible: boolean
  approvers: Approver[]
  expandedApproverId: string | null
  onExpandedApproverChange: (id: string | null) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  positionOptions: SelectOption[]
  organisationOptions: SelectOption[]
  filters: DocumentFilters
  onChangePositions: (positions: string[]) => void
  onChangeOrganisations: (organisations: string[]) => void
  matchingDocuments: DocumentRecord[]
  onChangeMatchingSelection: (checkedDocumentIds: string[]) => void
  isAddingApprover: boolean
  onStartAddingApprover: () => void
  onCancelAddingApprover: () => void
  sendToValue: string
  onSendToChange: (value: string) => void
  onAddApprover: () => void
  onRemoveApprover: (id: string) => void
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
  filters,
  onChangePositions,
  onChangeOrganisations,
  matchingDocuments,
  onChangeMatchingSelection,
  isAddingApprover,
  onStartAddingApprover,
  onCancelAddingApprover,
  sendToValue,
  onSendToChange,
  onAddApprover,
  onRemoveApprover,
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

  const activeApprover = approvers.find((approver) => approver.id === expandedApproverId)
  const selectedIds = activeApprover?.documentIds ?? []

  // A single "All matching documents" parent lets every match be checked
  // in one click.
  const treeItems: TreeItem[] = [
    {
      key: ROOT_KEY,
      title: (
        <Typography weight="semibold">
          {`All matching documents (${matchingDocuments.length})`}
        </Typography>
      ),
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

  const [isTreeExpanded, setIsTreeExpanded] = useState(true)

  const handleCheck = (checked: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    const keys = Array.isArray(checked) ? checked : checked.checked
    const documentIds = keys
      .map(String)
      .filter((key) => key.startsWith(DOCUMENT_KEY_PREFIX))
      .map((key) => key.slice(DOCUMENT_KEY_PREFIX.length))
    onChangeMatchingSelection(documentIds)
  }

  const showEmailInput = approvers.length === 0 || isAddingApprover

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
                    full-height expand arrow instead of centering it. The content
                    box's bottom padding is dropped so the tree sits flush. */}
                <style>{`
                  .approvers-collapsible .goat-collapse-header { align-items: center !important; }
                  .approvers-collapsible .goat-collapse-content-box { padding-bottom: 0 !important; }
                `}</style>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          <Typography as="span">{approver.email}</Typography>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <Chip
                            label={`${approver.documentIds.length} document${approver.documentIds.length === 1 ? '' : 's'} assigned`}
                            uppercase
                            chipStyle={chipStyles.ACCENT_NEUTRAL}
                            variant={chipVariants.SUBTLE}
                          />
                          {/* stopPropagation keeps the click from also toggling the collapsible. */}
                          <ButtonGhost
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation()
                              onRemoveApprover(approver.id)
                            }}
                            ariaLabel="Remove approver"
                          >
                            <Icon type={iconType.TrashOutlined} size={16} />
                          </ButtonGhost>
                        </div>
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

                          <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <Select
                                name="position"
                                label="Position"
                                placeholder="All positions"
                                multiple
                                options={positionOptions}
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
                                options={organisationOptions}
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
                            <div
                              style={{
                                maxHeight: DOCUMENT_TREE_MAX_HEIGHT,
                                overflowY: 'auto',
                              }}
                            >
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
                        </div>
                      ) : null,
                  }))}
                />
              </div>
            )}

            {showEmailInput ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    name="send-to"
                    label="Send to"
                    isRequired
                    placeholder="Insert email"
                    value={sendToValue}
                    onChange={(event) => onSendToChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && EMAIL_PATTERN.test(sendToValue.trim())) onAddApprover()
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
                {/* The field can only be dismissed once there's at least one
                    approver — otherwise there'd be no way to add the first. */}
                {approvers.length > 0 && (
                  <div style={{ paddingTop: 28 }}>
                    <ButtonGhost size="small" onClick={onCancelAddingApprover} ariaLabel="Remove email field">
                      <Icon type={iconType.TrashOutlined} size={16} />
                    </ButtonGhost>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <ButtonDashed size="small" leftIcon={iconType.PlusOutlined} onClick={onStartAddingApprover}>
                  Add another
                </ButtonDashed>
              </div>
            )}
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
