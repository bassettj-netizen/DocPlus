import { useState, type ReactNode } from 'react'
import { ButtonSecondary, buttonVariants, constants, Dropdown, Icon, iconType, Modal, Typography } from '@goat-ui/goat-ui-core'
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
  /** Already archived, with nothing edited since; otherwise Archive is on offer. */
  archived: boolean
  onExport: (format: ExportFormat) => void
  onArchive: () => void
  onClose: () => void
  onDone: () => void
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

function ActionRow({ title, description, status, action }: { title: string; description: string; status?: ReactNode; action: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 8, border: `1px solid ${colorPalette.neutral.lighten2}` }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography weight="semibold">{title}</Typography>
        <Typography size="base-sm" color="neutral-darken2">
          {description}
        </Typography>
        {status}
      </div>
      {action}
    </div>
  )
}

// The "Finish document" dialog for "Finish when saved". Export and Archive
// are separate actions that each happen straight away, in either order or
// not at all, and each row confirms once it's been done. Done closes the
// dialog and returns to the documents.
export default function FinishModal({
  visible,
  employeeName,
  documentName,
  archiveCategory,
  archived,
  onExport,
  onArchive,
  onClose,
  onDone,
}: FinishModalProps) {
  const [exported, setExported] = useState<ExportFormat[]>([])
  const [archivedHere, setArchivedHere] = useState(archived)

  const exportAs = (format: ExportFormat) => {
    onExport(format)
    setExported((prev) => (prev.includes(format) ? prev : [...prev, format]))
  }

  const archive = () => {
    onArchive()
    setArchivedHere(true)
  }

  return (
    <Modal
      visible={visible}
      title="Finish document"
      withIcon={false}
      onClose={onClose}
      maxWidth={580}
      footer={{ buttons: [{ variant: buttonVariants.PRIMARY, props: { children: 'Done', onClick: onDone } }] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <Typography>Your document is complete. Export it, archive it, or both.</Typography>

        <DocumentSummary
          rows={[
            { label: 'Employee', value: employeeName, note: '(chosen in step 2)', strong: true },
            { label: 'Document', value: documentName },
            { label: 'File', value: 'PDF · 2 pages' },
          ]}
        />

        <ActionRow
          title="Export"
          description="Download a copy to share or print."
          status={exported.length > 0 && <Done>Downloaded as {exported.map((format) => FORMAT_LABELS[format]).join(' and ')}</Done>}
          action={
            <Dropdown
              items={[
                { key: 'pdf', label: 'Download to PDF', onClick: () => exportAs('pdf') },
                { key: 'word', label: 'Download to Word', onClick: () => exportAs('word') },
              ]}
            >
              <ButtonSecondary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonSecondary>
            </Dropdown>
          }
        />

        <ActionRow
          title="Archive"
          description={`File it in ${employeeName}’s personnel file in ${ARCHIVE_SYSTEM}, under ${archiveCategory} (set on the template).`}
          status={archivedHere && <Done>Archived in {ARCHIVE_SYSTEM}</Done>}
          action={
            <ButtonSecondary disabled={archivedHere} onClick={archive}>
              Archive
            </ButtonSecondary>
          }
        />
      </div>
    </Modal>
  )
}
