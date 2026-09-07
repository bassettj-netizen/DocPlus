import {
  ButtonGhost,
  ButtonPrimary,
  ButtonTertiary,
  buttonWidth,
  DatePicker,
  Icon,
  iconType,
  Input,
  Panel,
  TextArea,
  Typography,
} from '@goat-ui/goat-ui-core'
import type { Approver } from './data'
import DocumentsDropdown from './DocumentsDropdown'
import PanelHeader from './PanelHeader'

const EMAIL_PATTERN = /\S+@\S+\.\S+/

interface RequestApprovalPanelProps {
  visible: boolean
  approvers: Approver[]
  onUpdateApproverEmail: (approverId: string, email: string) => void
  onUpdateApproverDocuments: (approverId: string, ids: string[]) => void
  onRemoveApprover: (approverId: string) => void
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
  onUpdateApproverEmail,
  onUpdateApproverDocuments,
  onRemoveApprover,
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
  const canSend = approvers.some((approver) => EMAIL_PATTERN.test(approver.email.trim())) && !!expirationDate
  const lastApprover = approvers[approvers.length - 1]
  const canAddApprover = !lastApprover || EMAIL_PATTERN.test(lastApprover.email.trim())

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

            {approvers.map((approver) => {
              const disabledDocumentIds = new Set(
                approvers.filter((a) => a.id !== approver.id).flatMap((a) => a.documentIds),
              )
              return (
                <div key={approver.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        name={`send-to-${approver.id}`}
                        label="Send to"
                        isRequired
                        placeholder="Insert email"
                        value={approver.email}
                        onChange={(event) => onUpdateApproverEmail(approver.id, event.target.value)}
                        helper="Anyone with access to this email will be able to open the link"
                      />
                    </div>
                    <div style={{ paddingTop: 24 }}>
                      <ButtonGhost onClick={() => onRemoveApprover(approver.id)} ariaLabel="Remove approver">
                        <Icon type={iconType.TrashOutlined} />
                      </ButtonGhost>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Typography size="base-sm" weight="semibold">
                      Documents
                    </Typography>
                    <DocumentsDropdown
                      selectedIds={approver.documentIds}
                      disabledDocumentIds={disabledDocumentIds}
                      onCommit={(ids) => onUpdateApproverDocuments(approver.id, ids)}
                      renderTrigger={(count) => (
                        <Input
                          readOnly
                          value={`${count} document${count === 1 ? '' : 's'} assigned`}
                          rightIcon={iconType.ChevronDownOutlined}
                        />
                      )}
                    />
                  </div>
                </div>
              )
            })}

            <ButtonTertiary width={buttonWidth.EXPANDED} leftIcon={iconType.PlusOutlined} disabled={!canAddApprover} onClick={onAddApprover}>
              Add approver
            </ButtonTertiary>
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
