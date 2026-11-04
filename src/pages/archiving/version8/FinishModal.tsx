import { useState, type ReactNode } from 'react'
import { ButtonPrimary, ButtonSecondary, constants, Dropdown, Icon, iconType, Modal, Typography } from '@goat-ui/goat-ui-core'
import DocumentSummary from '../shared/DocumentSummary'
import { ARCHIVE_SYSTEM } from '../shared/data'

const { colorPalette } = constants

export type ExportFormat = 'pdf' | 'word'

const FORMAT_LABELS: Record<ExportFormat, string> = { pdf: 'PDF', word: 'Word' }

interface FinishModalProps {
  visible: boolean
  employeeName: string
  documentName: string
  archiveCategory: string
  onExport: (format: ExportFormat) => void
  onClose: () => void
  onDone: (archive: boolean) => void
}

function Done({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
      <Typography as="span" size="base-sm">
        {children}
      </Typography>
    </span>
  )
}

// The "Finish document" dialog for "Done or archive": Version 6's dialog
// without the Archive row. Export still happens straight away; archiving is
// instead a way of completing: a primary Done button opens a menu of Done
// or Done and archive. The Modal footer only takes plain buttons, not a
// Dropdown, so the button sits at the end of the body in the footer's place.
export default function FinishModal({ visible, employeeName, documentName, archiveCategory, onExport, onClose, onDone }: FinishModalProps) {
  const [exported, setExported] = useState<ExportFormat[]>([])

  const exportAs = (format: ExportFormat) => {
    onExport(format)
    setExported((prev) => (prev.includes(format) ? prev : [...prev, format]))
  }

  return (
    <Modal visible={visible} title="Finish document" withIcon={false} onClose={onClose} maxWidth={580}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <Typography>Your document is complete. Export a copy if you need one, then choose Done, or Done and archive.</Typography>

        <DocumentSummary
          rows={[
            { label: 'Employee', value: employeeName, note: '(chosen in step 2)', strong: true },
            { label: 'Document', value: documentName },
            { label: 'File', value: 'PDF · 2 pages' },
            { label: 'Archives to', value: `${ARCHIVE_SYSTEM} · ${archiveCategory}`, note: '(set on the template)' },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 8, border: `1px solid ${colorPalette.neutral.lighten2}` }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography weight="semibold">Export</Typography>
            <Typography size="base-sm" color="neutral-darken2">
              Download a copy to share or print.
            </Typography>
            {exported.length > 0 && <Done>Downloaded as {exported.map((format) => FORMAT_LABELS[format]).join(' and ')}</Done>}
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

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Dropdown
            placement="bottomRight"
            items={[
              { key: 'done', label: 'Done', onClick: () => onDone(false) },
              { key: 'archive', label: 'Done and archive', onClick: () => onDone(true) },
            ]}
          >
            <ButtonPrimary rightIcon={iconType.ChevronDownOutlined}>Done</ButtonPrimary>
          </Dropdown>
        </div>
      </div>
    </Modal>
  )
}
