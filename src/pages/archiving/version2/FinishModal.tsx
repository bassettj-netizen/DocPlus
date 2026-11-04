import { useState } from 'react'
import { ButtonSecondary, buttonVariants, Checkbox, Dropdown, iconType, Modal, Typography } from '@goat-ui/goat-ui-core'
import DocumentSummary from '../shared/DocumentSummary'
import { ARCHIVE_SYSTEM } from '../shared/data'

export interface FinishChoices {
  archive: boolean
  pdf: boolean
  word: boolean
}

interface FinishModalProps {
  visible: boolean
  employeeName: string
  documentName: string
  archiveCategory: string
  onCancel: () => void
  onConfirm: (choices: FinishChoices) => void
}

// The "Finish document" dialog from the Figma Finish button flow: a summary,
// then the next steps — Share and Export menus, archiving (ticked by
// default) and optional downloads.
export default function FinishModal({ visible, employeeName, documentName, archiveCategory, onCancel, onConfirm }: FinishModalProps) {
  const [choices, setChoices] = useState<FinishChoices>({ archive: true, pdf: false, word: false })
  const toggle = (key: keyof FinishChoices) => setChoices((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <Modal
      visible={visible}
      title="Finish document"
      withIcon={false}
      onClose={onCancel}
      maxWidth={580}
      footer={{
        buttons: [
          { variant: buttonVariants.TERTIARY, props: { children: 'Cancel', onClick: onCancel } },
          {
            variant: buttonVariants.PRIMARY,
            props: { children: choices.archive ? 'Finish and archive' : 'Finish', onClick: () => onConfirm(choices) },
          },
        ],
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <Typography>Your document is complete. Choose what happens next.</Typography>

        <DocumentSummary
          rows={[
            { label: 'Employee', value: employeeName, note: '(chosen in step 2)', strong: true },
            { label: 'Document', value: documentName },
            { label: 'File', value: 'PDF · 2 pages' },
          ]}
        />

        <Typography weight="semibold">Next steps</Typography>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
          <Dropdown
            items={[
              { key: 'request-information', label: 'Request information' },
              { key: 'request-approval', label: 'Request approval' },
              { key: 'request-signature', label: 'Request signature' },
              { key: 'manage-access', label: 'Manage access' },
            ]}
          >
            <ButtonSecondary rightIcon={iconType.ChevronDownOutlined}>Share</ButtonSecondary>
          </Dropdown>
          <Dropdown
            items={[
              { key: 'pdf', label: 'Download as PDF' },
              { key: 'word', label: 'Download as Word' },
            ]}
          >
            <ButtonSecondary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonSecondary>
          </Dropdown>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Checkbox
            name="archive"
            checked={choices.archive}
            onChange={() => toggle('archive')}
            helper={`Category: ${archiveCategory} (set on the template)`}
          >
            {`Archive in ${employeeName}’s personnel file (${ARCHIVE_SYSTEM})`}
          </Checkbox>
          <Checkbox name="pdf" checked={choices.pdf} onChange={() => toggle('pdf')}>
            Download PDF
          </Checkbox>
          <Checkbox name="word" checked={choices.word} onChange={() => toggle('word')}>
            Download to Word
          </Checkbox>
        </div>
      </div>
    </Modal>
  )
}
