import { buttonVariants, Modal, modalVariants, Typography } from '@goat-ui/goat-ui-core'
import type { ChangeLogEntry } from './data'

interface CancelPublishingModalProps {
  entry: ChangeLogEntry | null
  onKeepIt: () => void
  onConfirm: () => void
}

// Confirms the destructive "Cancel publishing" action from ChangeLogPanel —
// only ever shown for a Scheduled entry.
export default function CancelPublishingModal({ entry, onKeepIt, onConfirm }: CancelPublishingModalProps) {
  return (
    <Modal
      visible={!!entry}
      variant={modalVariants.DANGER}
      withIcon
      title="Cancel publishing"
      onClose={onKeepIt}
      footer={{
        buttons: [
          { variant: buttonVariants.TERTIARY, props: { children: 'Keep it', onClick: onKeepIt } },
          { variant: buttonVariants.DANGER, props: { children: 'Cancel publishing', onClick: onConfirm } },
        ],
      }}
    >
      {entry && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <Typography>
            This will cancel the scheduled publishing of{' '}
            <Typography as="span" weight="semibold">
              {entry.templateName} [{entry.haufeIndex}]
            </Typography>
            .
          </Typography>
          <Typography>This action cannot be undone.</Typography>
        </div>
      )}
    </Modal>
  )
}
