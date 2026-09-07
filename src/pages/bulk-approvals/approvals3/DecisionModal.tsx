import { useState } from 'react'
import { buttonVariants, Modal, modalVariants, TextArea, Typography } from '@goat-ui/goat-ui-core'
import type { ApprovalStatus } from './data'

export interface PendingDecision {
  status: Exclude<ApprovalStatus, 'pending'>
  documents: { id: string; employeeName: string }[]
}

interface DecisionModalProps {
  pending: PendingDecision | null
  onCancel: () => void
  onConfirm: (message: string) => void
}

// Matches the Figma "Approve document" modal: default variant, no icon, a
// Message textarea, Cancel/Send footer. For a batch decided from the list's
// bulk bar, the affected names are spelled out here — the one place this
// version repeats them — rather than duplicating a summary list elsewhere.
export default function DecisionModal({ pending, onCancel, onConfirm }: DecisionModalProps) {
  const [message, setMessage] = useState('')

  const count = pending?.documents.length ?? 0
  const isApprove = pending?.status === 'approved'
  const isBulk = count > 1
  const verb = isApprove ? 'approve' : 'reject'
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
        <Typography>
          {isBulk ? `Are you sure you want to ${verb} these ${count} documents?` : `Are you sure you want to ${verb} this document?`}
        </Typography>

        {isBulk && (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {pending?.documents.map((doc) => (
              <li key={doc.id}>
                <Typography color="neutral-darken2">{doc.employeeName}</Typography>
              </li>
            ))}
          </ul>
        )}

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
