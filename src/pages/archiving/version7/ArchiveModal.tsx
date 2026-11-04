import { buttonVariants, Modal, Typography } from '@goat-ui/goat-ui-core'
import DocumentSummary from '../shared/DocumentSummary'
import { ARCHIVE_SYSTEM, formatDate } from '../shared/data'

interface ArchiveModalProps {
  visible: boolean
  employeeName: string
  documentName: string
  /** When it was last archived, if the user is archiving an edited version. */
  previouslyArchivedAt?: Date
  onCancel: () => void
  onConfirm: () => void
}

// Archiving can't be taken back from the editor, so Archive asks first:
// where the document is filed, and what happens to it here afterwards.
// Archiving again after Edit files a new version; earlier ones stay put.
export default function ArchiveModal({ visible, employeeName, documentName, previouslyArchivedAt, onCancel, onConfirm }: ArchiveModalProps) {
  const steps = [
    `A PDF of the document is filed in ${employeeName}’s personnel file in ${ARCHIVE_SYSTEM}.`,
    previouslyArchivedAt && `It’s filed as a new version. The version archived on ${formatDate(previouslyArchivedAt)} stays in the personnel file.`,
    'The document is locked here so it matches what was filed. To change it later, choose Edit, then archive it again.',
  ].filter(Boolean)

  return (
    <Modal
      visible={visible}
      title="Archive document?"
      withIcon={false}
      onClose={onCancel}
      maxWidth={580}
      footer={{
        buttons: [
          { variant: buttonVariants.TERTIARY, props: { children: 'Cancel', onClick: onCancel } },
          { variant: buttonVariants.PRIMARY, props: { children: 'Archive', onClick: onConfirm } },
        ],
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <DocumentSummary
          rows={[
            { label: 'Employee', value: employeeName, strong: true },
            { label: 'Document', value: documentName },
            { label: 'Archives to', value: `Personnel file in ${ARCHIVE_SYSTEM}` },
          ]}
        />

        <Typography weight="semibold">What happens next</Typography>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((step) => (
            <li key={step}>
              <Typography as="span">{step}</Typography>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
