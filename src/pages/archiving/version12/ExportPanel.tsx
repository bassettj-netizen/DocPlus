import { useState, type ReactNode } from 'react'
import { ButtonGhost, ButtonPrimary, ButtonSecondary, constants, Icon, iconType, Panel, RadioGroup, radioGroupDirection, Select, Typography } from '@goat-ui/goat-ui-core'
import DocumentSummary from '../shared/DocumentSummary'
import { ARCHIVE_FOLDERS, ARCHIVE_RETENTION_DAYS, ARCHIVE_SYSTEM } from '../shared/data'

const { colorPalette } = constants

export type ExportFormat = 'pdf' | 'word'

interface ExportPanelProps {
  visible: boolean
  employeeName: string
  documentName: string
  /** Already archived; Archive is then shown as done. */
  archived: boolean
  /** The folder preselected for archiving (the template's suggestion), or the one it was archived to. */
  folder: string
  onExport: (format: ExportFormat) => void
  onArchive: (folder: string) => void
  onClose: () => void
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

const FORMAT_LABELS: Record<ExportFormat, string> = { pdf: 'PDF', word: 'Word' }

/** A bordered box: a title and description, then a choice beside the button that acts on it.
 *  `alignAction="bottom"` lines the button up with the bottom of the choice, below its label. */
function ActionBox({
  title,
  description,
  choice,
  action,
  status,
  alignAction = 'center',
}: {
  title: ReactNode
  description: string
  choice: ReactNode
  action: ReactNode
  status?: ReactNode
  alignAction?: 'center' | 'bottom'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 8, border: `1px solid ${colorPalette.neutral.lighten2}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography weight="semibold">{title}</Typography>
        <Typography size="base-sm" color="neutral-darken2">
          {description}
        </Typography>
      </div>
      <div style={{ display: 'flex', alignItems: alignAction === 'bottom' ? 'flex-end' : 'center', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>{choice}</div>
        {action}
      </div>
      {status}
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography size="base-sm" weight="semibold" color="neutral-darken2">
      {children}
    </Typography>
  )
}

// The "Export document" panel: Version 11's Export dialog, unchanged inside,
// but sliding in from the right instead of opening in the middle of the
// screen. Two "choose, then act" boxes: Download (PDF or Word, then Download) and
// Archive (pick the personnel-file folder — the template's is preselected —
// then Archive). Each action happens straight away, in
// any order or not at all. Downloads aren't confirmed; Archive confirms in
// its row. Archiving doesn't wait for the mandatory fields. Done
// just closes the panel.
export default function ExportPanel({
  visible,
  employeeName,
  documentName,
  archived,
  folder: initialFolder,
  onExport,
  onArchive,
  onClose,
}: ExportPanelProps) {
  const [archivedHere, setArchivedHere] = useState(archived)
  const [folder, setFolder] = useState(initialFolder)
  const [format, setFormat] = useState<ExportFormat>('pdf')

  const archive = () => {
    onArchive(folder)
    setArchivedHere(true)
  }

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      // Same header as the bulk-approvals panels: title, then a close button.
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
          <span style={{ display: 'inline-block', flex: 1 }}>
            <Typography as="span" size="heading-lg" weight="semibold">
              Export document
            </Typography>
          </span>
          <ButtonGhost onClick={onClose} ariaLabel="Close">
            <Icon type={iconType.CrossOutlined} />
          </ButtonGhost>
        </span>
      }
      footer={{
        divider: true,
        content: (
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <ButtonPrimary onClick={onClose}>Done</ButtonPrimary>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        <Typography>Download a copy, archive it in {ARCHIVE_SYSTEM}, or both.</Typography>

        <DocumentSummary
          rows={[
            { label: 'Employee', value: employeeName, strong: true },
            { label: 'Document', value: documentName },
            { label: 'Length', value: '2 pages' },
          ]}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>Download</SectionLabel>
          <ActionBox
            title="Download a copy"
            alignAction="bottom"
            description="Choose a format to save it to your computer."
            choice={
              <RadioGroup
                name="export-format"
                label="Format"
                direction={radioGroupDirection.ROW}
                options={(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((key) => ({ label: FORMAT_LABELS[key], value: key }))}
                value={format}
                onChange={(event) => setFormat(event.target.value as ExportFormat)}
              />
            }
            action={<ButtonSecondary onClick={() => onExport(format)}>Download</ButtonSecondary>}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>Archive</SectionLabel>
          {/* Locked once archived. */}
          <ActionBox
            title={`Archive in ${ARCHIVE_SYSTEM}`}
            alignAction="bottom"
            description={`File it in ${employeeName}’s personnel file in ${ARCHIVE_SYSTEM}. After ${ARCHIVE_RETENTION_DAYS} days it’s deleted from HR Dokumente; the copy in ${ARCHIVE_SYSTEM} stays.`}
            choice={
              <Select
                name="archive-folder"
                label="Folder"
                isRequired
                value={folder}
                onChange={(value) => setFolder(String(value))}
                options={ARCHIVE_FOLDERS.map((name) => ({ label: name, value: name }))}
                placeholder="Choose a folder"
                hasSearch
                disabled={archivedHere}
              />
            }
            action={
              <ButtonSecondary disabled={archivedHere || !folder} onClick={archive}>
                Archive
              </ButtonSecondary>
            }
            status={
              archivedHere && (
                <Done>
                  Archived in {ARCHIVE_SYSTEM}, in {folder}
                </Done>
              )
            }
          />
        </div>
      </div>
    </Panel>
  )
}
