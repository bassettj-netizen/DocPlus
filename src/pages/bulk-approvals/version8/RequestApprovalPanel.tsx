import {
  ButtonDashed,
  ButtonGhost,
  ButtonPrimary,
  ButtonTertiary,
  constants,
  DatePicker,
  Icon,
  Input,
  iconType,
  Panel,
  TextArea,
  Typography,
} from '@goat-ui/goat-ui-core'
import type { Approver } from './data'
import PanelHeader from './PanelHeader'

const { colorPalette } = constants

const EMAIL_PATTERN = /\S+@\S+\.\S+/

interface RequestApprovalPanelProps {
  visible: boolean
  approvers: Approver[]
  sendToValue: string
  onSendToChange: (value: string) => void
  onAddApprover: () => void
  isAddingApprover: boolean
  onStartAddingApprover: () => void
  onCancelAddingApprover: () => void
  onRemoveApprover: (approverId: string) => void
  message: string
  onMessageChange: (value: string) => void
  expirationDate: Date | undefined
  onExpirationChange: (date: Date | null) => void
  onOpenAssignDocuments: (approverId: string) => void
  totalAssignedCount: number
  totalDocumentCount: number
  onClose: () => void
  onSubmit: () => void
}

export default function RequestApprovalPanel({
  visible,
  approvers,
  sendToValue,
  onSendToChange,
  onAddApprover,
  isAddingApprover,
  onStartAddingApprover,
  onCancelAddingApprover,
  onRemoveApprover,
  message,
  onMessageChange,
  expirationDate,
  onExpirationChange,
  onOpenAssignDocuments,
  totalAssignedCount,
  totalDocumentCount,
  onClose,
  onSubmit,
}: RequestApprovalPanelProps) {
  const canSend = approvers.length > 0 && !!expirationDate
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

            {approvers.map((approver) => (
              <div
                key={approver.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: `1px solid ${colorPalette.neutral.lighten2}`,
                  borderRadius: 8,
                  padding: '8px 8px 8px 12px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <Typography as="span">{approver.email}</Typography>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <ButtonTertiary onClick={() => onOpenAssignDocuments(approver.id)}>
                    {approver.documentIds.length > 0
                      ? `${approver.documentIds.length} document${approver.documentIds.length === 1 ? '' : 's'} assigned`
                      : 'Assign documents'}
                  </ButtonTertiary>
                  <ButtonGhost size="small" onClick={() => onRemoveApprover(approver.id)} ariaLabel="Remove approver">
                    <Icon type={iconType.TrashOutlined} size={16} />
                  </ButtonGhost>
                </div>
              </div>
            ))}

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
