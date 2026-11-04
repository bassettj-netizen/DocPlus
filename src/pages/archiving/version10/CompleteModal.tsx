import { useState, type ReactNode } from 'react'
import { ButtonSecondary, buttonVariants, constants, Dropdown, Icon, iconType, Modal, Typography } from '@goat-ui/goat-ui-core'
import DocumentSummary from '../shared/DocumentSummary'
import { ARCHIVE_SYSTEM } from '../shared/data'

const { colorPalette } = constants

export type ExportFormat = 'pdf' | 'word'

const FORMAT_LABELS: Record<ExportFormat, string> = { pdf: 'PDF', word: 'Word' }

interface CompleteModalProps {
  visible: boolean
  employeeName: string
  documentName: string
  onExport: (format: ExportFormat) => void
  onCancel: () => void
  onDone: () => void
}

function Downloaded({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
      <Typography as="span" size="base-sm">
        {children}
      </Typography>
    </span>
  )
}

// The "Complete document" dialog for "Auto-archive on Done". There's no
// separate Archive step: Done completes the document and archives it, so
// the dialog says up front where it goes and what changes, and offers an
// optional download first. Cancel leaves everything as it was.
export default function CompleteModal({ visible, employeeName, documentName, onExport, onCancel, onDone }: CompleteModalProps) {
  const [exported, setExported] = useState<ExportFormat[]>([])

  const exportAs = (format: ExportFormat) => {
    onExport(format)
    setExported((prev) => (prev.includes(format) ? prev : [...prev, format]))
  }

  const steps = [
    `It’s filed in ${employeeName}’s personnel file in ${ARCHIVE_SYSTEM}.`,
    `Its status in My documents changes to Archived in ${ARCHIVE_SYSTEM}.`,
    'It’s locked so it matches what was filed. You can still open it and export a copy.',
  ]

  return (
    <Modal
      visible={visible}
      title="Complete document"
      withIcon={false}
      onClose={onCancel}
      maxWidth={580}
      footer={{
        buttons: [
          { variant: buttonVariants.TERTIARY, props: { children: 'Cancel', onClick: onCancel } },
          { variant: buttonVariants.PRIMARY, props: { children: 'Done', onClick: onDone } },
        ],
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <Typography>Your document is ready. Check the details, download a copy if you need one, then choose Done.</Typography>

        <DocumentSummary
          rows={[
            { label: 'Employee', value: employeeName, strong: true },
            { label: 'Document', value: documentName },
            { label: 'Archives to', value: `Personnel file in ${ARCHIVE_SYSTEM}` },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 8, border: `1px solid ${colorPalette.neutral.lighten2}` }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography weight="semibold">Export (optional)</Typography>
            <Typography size="base-sm" color="neutral-darken2">
              Download a copy to share or print.
            </Typography>
            {exported.length > 0 && <Downloaded>Downloaded as {exported.map((format) => FORMAT_LABELS[format]).join(' and ')}</Downloaded>}
          </div>
          <Dropdown
            items={[
              { key: 'pdf', label: 'Download to PDF', onClick: () => exportAs('pdf') },
              { key: 'word', label: 'Download to Word', onClick: () => exportAs('word') },
            ]}
          >
            <ButtonSecondary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonSecondary>
          </Dropdown>
        </div>

        <Typography weight="semibold">When you choose Done</Typography>
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
