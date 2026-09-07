import { useState } from 'react'
import { buttonVariants, Modal, modalVariants, TextArea, Typography } from '@goat-ui/goat-ui-core'
import type { ApprovalStatus } from './data'

export interface PendingDecision {
  status: Exclude<ApprovalStatus, 'pending'>
  count: number
}

interface DecisionModalProps {
  pending: PendingDecision | null
  onCancel: () => void
  onConfirm: (message: string) => void
}

// Matches the Figma "Approve document" modal: a Message textarea, Cancel/Send
// footer. Reject uses the same layout with the copy swapped. Approve renders
// with the success variant's icon, Reject with the danger variant's.
export default function DecisionModal({ pending, onCancel, onConfirm }: DecisionModalProps) {
  const [message, setMessage] = useState('')

  const isApprove = pending?.status === 'approved'
  const isBulk = (pending?.count ?? 0) > 1
  const verb = isApprove ? 'approve' : 'reject'
  const documentPhrase = isBulk ? `these ${pending?.count} documents` : 'this document'
  const title = isApprove ? (isBulk ? 'Approve documents' : 'Approve document') : isBulk ? 'Reject documents' : 'Reject document'

  const handleCancel = () => {
    setMessage('')
    onCancel()
  }

  const handleSend = () => {
    onConfirm(message)
    setMessage('')
  }

  return (
    <Modal
      visible={!!pending}
      variant={isApprove ? modalVariants.SUCCESS : modalVariants.DANGER}
      withIcon
      title={title}
      onClose={handleCancel}
      footer={{
        buttons: [
          { variant: buttonVariants.TERTIARY, props: { children: 'Cancel', onClick: handleCancel } },
          { variant: buttonVariants.PRIMARY, props: { children: 'Send', onClick: handleSend } },
        ],
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <Typography>{`Are you sure you want to ${verb} ${documentPhrase}?`}</Typography>
        <TextArea
          name="decision-message"
          label="Message"
          placeholder="Insert text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
    </Modal>
  )
}
