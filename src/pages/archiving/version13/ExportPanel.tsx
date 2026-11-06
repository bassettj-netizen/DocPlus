import { useState, type ReactNode } from 'react'
import {
  ButtonGhost,
  ButtonPrimary,
  ButtonSecondary,
  constants,
  Chip,
  chipStyles,
  Icon,
  iconType,
  Input,
  Panel,
  Radio,
  RadioGroup,
  radioGroupDirection,
  Select,
  Typography,
} from '@goat-ui/goat-ui-core'
import DocumentSummary from '../shared/DocumentSummary'
import { ARCHIVE_FOLDERS, ARCHIVE_RETENTION_DAYS, ARCHIVE_SYSTEM, employeeName, GENERIC_ARCHIVE_SYSTEM, type Employee } from '../shared/data'
import { UpgradeModal } from '../shared/Upgrade'
import { useArchivingVersion } from '../shared/version'

const { colorPalette } = constants

export type ExportFormat = 'pdf' | 'word'
export type FileLayout = 'separate' | 'combined'

export interface DownloadRequest {
  employeeIds: string[]
  format: ExportFormat
  layout: FileLayout
  fileName: string
}

interface ExportPanelProps {
  visible: boolean
  /** One employee for an individual document; everyone it's created for in a bulk one. */
  employees: Employee[]
  /** A bulk document: adds the Employees choice and separate / combined files. */
  bulk: boolean
  documentName: string
  /** The employees whose copy is already archived (for an individual document, its one employee once archived). */
  archivedEmployeeIds: string[]
  /** The folder preselected for archiving (the template's suggestion), or the one it was archived to. */
  folder: string
  onDownload: (request: DownloadRequest) => void
  onArchive: (employeeIds: string[], folder: string) => void
  onClose: () => void
}

const FORMAT_LABELS: Record<ExportFormat, string> = { pdf: 'PDF', word: 'Word' }
const EXTENSIONS: Record<ExportFormat, string> = { pdf: 'pdf', word: 'docx' }

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

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography size="base-sm" weight="semibold" color="neutral-darken2">
      {children}
    </Typography>
  )
}

/** Version 12's bordered "choose, then act" box: title and description, the choices, then the button that acts on them. */
function ActionBox({ title, description, children, action, status }: { title: ReactNode; description: string; children: ReactNode; action: ReactNode; status?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderRadius: 8, border: `1px solid ${colorPalette.neutral.lighten2}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography weight="semibold">{title}</Typography>
        <Typography size="base-sm" color="neutral-darken2">
          {description}
        </Typography>
      </div>
      {children}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>{status}</div>
        {action}
      </div>
    </div>
  )
}

/** Version 14: Archive isn't in this plan. Instead of a disabled form, a tinted card says so up front — "Upgrade"
 *  chip with a crown, what archiving would save them, and one button into the upgrade dialog. */
function ArchiveUpsell({ system, bulk, onUpgrade }: { system: string; bulk: boolean; onUpgrade: () => void }) {
  const benefits = [
    bulk ? 'File every employee’s copy in one go' : 'File documents straight into the personnel file',
    'No more downloading and uploading by hand',
    `Documents stay safe in ${system} after HR Dokumente clears them out`,
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderRadius: 8, border: `1px solid ${colorPalette.blue.lighten4}`, backgroundColor: colorPalette.blue.lighten5 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Typography weight="semibold">{`Archive in ${system}`}</Typography>
          <Chip label="Upgrade" chipStyle={chipStyles.ACCENT_YELLOW} leftIcon={iconType.CrownOutlined} />
        </span>
        <Typography size="base-sm" color="neutral-darken2">
          Archiving isn’t included in your plan. Upgrade to send documents to {system} straight from HR Dokumente.
        </Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {benefits.map((benefit) => (
          <span key={benefit} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography as="span" size="base-sm">
              {benefit}
            </Typography>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonSecondary leftIcon={iconType.RocketOutlined} onClick={onUpgrade}>
          See upgrade options
        </ButtonSecondary>
      </div>
    </div>
  )
}

/** The bulk design's "Separate files / One combined file" cards: a radio, an icon and title, and a description. */
function ChoiceCard({ checked, onSelect, icon, title, description }: { checked: boolean; onSelect: () => void; icon: string; title: string; description: string }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        border: `1px solid ${checked ? colorPalette.blue.base : colorPalette.neutral.lighten2}`,
      }}
    >
      <Radio name="file-layout" checked={checked} onChange={onSelect} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon type={icon} size={16} />
          <Typography as="span">{title}</Typography>
        </span>
        <Typography as="span" size="base-sm" color="neutral-darken2">
          {description}
        </Typography>
      </span>
    </label>
  )
}

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`

// One "Export" panel for individual and bulk documents. Version 12's panel
// (slides in from the right; Download and Archive each act straight away, in
// any order; Done closes) with the bulk design's export choices folded in:
//
// - Employees (bulk only) — All, or Selected from a list, labelled like Format. It sets who both
//   Download and Archive act on, so it sits above them.
// - Files (bulk only) — separate files, one per employee, or one combined file.
// - File name — prefilled with the document title, editable. The employee's
//   name always goes in front, so files from different employees never clash;
//   the hint shows the resulting name. Individual documents get this too.
//
// Archive files one document per employee, all together in the one
// HR system folder chosen — a combined file only applies to the download.
// Copies already archived are skipped and counted.
export default function ExportPanel({
  visible,
  employees,
  bulk,
  documentName,
  archivedEmployeeIds,
  folder: initialFolder,
  onDownload,
  onArchive,
  onClose,
}: ExportPanelProps) {
  const [scope, setScope] = useState<'all' | 'selected'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [layout, setLayout] = useState<FileLayout>('separate')
  const [fileName, setFileName] = useState(documentName)
  const [folder, setFolder] = useState(initialFolder)
  const [downloaded, setDownloaded] = useState<string>()
  const [archivedHere, setArchivedHere] = useState<number>()

  // Version 14: individual documents have no employee, so nothing here depends on one.
  const { noEmployee, genericArchiveSystem, archiving } = useArchivingVersion()
  const withoutEmployee = !!noEmployee && !bulk
  const inScope = bulk && scope === 'selected' ? employees.filter((e) => selectedIds.includes(e.id)) : employees
  const toArchive = inScope.filter((e) => !archivedEmployeeIds.includes(e.id))
  const alreadyArchived = inScope.length - toArchive.length
  const allArchived = inScope.length > 0 && toArchive.length === 0

  const extension = EXTENSIONS[format]
  const name = fileName.trim()
  const combined = bulk && layout === 'combined'
  const firstEmployee = inScope[0] ?? employees[0]
  const exampleFile = combined || !firstEmployee ? `${name}.${extension}` : `${employeeName(firstEmployee)} – ${name}.${extension}`

  // Any change to what would be downloaded clears the last "Downloaded" note.
  const changed =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value)
      setDownloaded(undefined)
    }

  // A new choice of employees also clears the last "Archived" note.
  const changedScope =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      changed(set)(value)
      setArchivedHere(undefined)
    }

  const download = () => {
    onDownload({ employeeIds: inScope.map((e) => e.id), format, layout: combined ? 'combined' : 'separate', fileName: name })
    setDownloaded(
      combined
        ? `Downloaded 1 ${FORMAT_LABELS[format]} file with ${plural(inScope.length, 'document')}`
        : `Downloaded ${plural(inScope.length, `${FORMAT_LABELS[format]} file`)}`,
    )
  }

  const archive = () => {
    onArchive(
      toArchive.map((e) => e.id),
      folder,
    )
    setArchivedHere(toArchive.length)
  }

  let archiveStatus: ReactNode = null
  if (archivedHere !== undefined) {
    archiveStatus = (
      <Done>
        {bulk ? `Archived ${plural(archivedHere, 'document')}` : 'Archived'} in {ARCHIVE_SYSTEM}, in {folder}
      </Done>
    )
  } else if (allArchived) {
    archiveStatus = <Done>{bulk ? `${inScope.length === 1 ? 'Already' : 'All already'} archived in ${ARCHIVE_SYSTEM}` : `Archived in ${ARCHIVE_SYSTEM}`}</Done>
  } else if (alreadyArchived > 0) {
    archiveStatus = (
      <Typography as="span" size="base-sm" color="neutral-darken2">
        {alreadyArchived} {alreadyArchived === 1 ? 'is' : 'are'} already archived and will be skipped
      </Typography>
    )
  }

  const noneSelected = !withoutEmployee && inScope.length === 0
  const nothingToArchive = !withoutEmployee && toArchive.length === 0
  // Version 13: users choose their HR system, so the intro and description don't name it — the title and statuses still do.
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const introSystem = genericArchiveSystem ? GENERIC_ARCHIVE_SYSTEM : ARCHIVE_SYSTEM
  // Versions 14 and 15 (no archiving in the plan) only download.
  const intro = archiving
    ? bulk ? 'Download copies of the documents.' : 'Download a copy of the document.'
    : bulk ? `Download copies, archive them in ${introSystem}, or both.` : `Download a copy, archive it in ${introSystem}, or both.`
  const employeeLabel = employees[0] && !withoutEmployee ? employeeName(employees[0]) : 'the employee'
  const archiveDescription = genericArchiveSystem
    ? bulk
      ? `File all documents together in the folder you choose. After ${ARCHIVE_RETENTION_DAYS} days, they’re deleted from HR Dokumente but stay in ${GENERIC_ARCHIVE_SYSTEM}.`
      : `File it in ${employeeLabel}’s personnel file. After ${ARCHIVE_RETENTION_DAYS} days, it’s deleted from HR Dokumente but stays in ${GENERIC_ARCHIVE_SYSTEM}.`
    : bulk
      ? `All documents are filed together in the folder you choose in ${ARCHIVE_SYSTEM}. After ${ARCHIVE_RETENTION_DAYS} days they’re deleted from HR Dokumente; the copies in ${ARCHIVE_SYSTEM} stay.`
      : `File it in ${employeeLabel}’s personnel file in ${ARCHIVE_SYSTEM}. After ${ARCHIVE_RETENTION_DAYS} days it’s deleted from HR Dokumente; the copy in ${ARCHIVE_SYSTEM} stays.`
  const title = bulk ? 'Export documents' : 'Export document'

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
          <span style={{ display: 'inline-block', flex: 1 }}>
            <Typography as="span" size="heading-lg" weight="semibold">
              {title}
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
        <Typography>{intro}</Typography>

        {bulk ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <RadioGroup
              name="export-employees"
              label="Employees"
              direction={radioGroupDirection.ROW}
              options={[
                { label: `All (${employees.length})`, value: 'all' },
                { label: 'Selected', value: 'selected' },
              ]}
              value={scope}
              onChange={(event) => changedScope(setScope)(event.target.value as 'all' | 'selected')}
            />
            {scope === 'selected' && (
              <Select
                name="export-selected-employees"
                placeholder="Select one or more employees"
                multiple
                hasSearch
                value={selectedIds}
                onChange={(value) => changedScope(setSelectedIds)((value as string[]).map(String))}
                options={employees.map((e) => ({ label: archivedEmployeeIds.includes(e.id) ? `${employeeName(e)} (archived)` : employeeName(e), value: e.id }))}
              />
            )}
          </div>
        ) : (
          <DocumentSummary
            rows={[
              // Version 14: the document has no employee, so the row says so.
              { label: 'Employee', value: withoutEmployee ? 'Undefined' : employees[0] ? employeeName(employees[0]) : '', strong: true },
              { label: 'Document', value: documentName },
            ]}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>Download</SectionLabel>
          <ActionBox
            title={bulk ? 'Download copies' : 'Download a copy'}
            description="Choose a format to save it to your computer."
            action={
              <ButtonSecondary disabled={!name || noneSelected} onClick={download}>
                {/* Separate bulk files: say how many are coming, like "Archive 3 documents". */}
                {bulk && !combined && !noneSelected ? `Download ${plural(inScope.length, 'file')}` : 'Download'}
              </ButtonSecondary>
            }
            status={downloaded && <Done>{downloaded}</Done>}
          >
            <RadioGroup
              name="export-format"
              label="Format"
              direction={radioGroupDirection.ROW}
              options={(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((key) => ({ label: FORMAT_LABELS[key], value: key }))}
              value={format}
              onChange={(event) => changed(setFormat)(event.target.value as ExportFormat)}
            />

            {bulk && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography size="base-sm">Files</Typography>
                <ChoiceCard
                  checked={layout === 'separate'}
                  onSelect={() => changed(setLayout)('separate')}
                  icon={iconType.LayersVerOutlined}
                  title="Separate files – one per employee"
                  description={noneSelected ? 'Individual files will be generated' : `${plural(inScope.length, 'file')} will be generated`}
                />
                <ChoiceCard
                  checked={layout === 'combined'}
                  onSelect={() => changed(setLayout)('combined')}
                  icon={iconType.ClipboardOutlined}
                  title="One combined file"
                  description="All documents merged into a single file"
                />
              </div>
            )}

            <Input
              name="export-file-name"
              label="File name"
              isRequired
              value={fileName}
              onChange={(event) => changed(setFileName)(event.target.value)}
              error={name ? undefined : 'Enter a file name'}
              helperMaxLines={3}
              helper={name && !combined && !withoutEmployee ? `The employee’s name goes before the file name, e.g. “${exampleFile}”` : undefined}
            />
          </ActionBox>
        </div>

        {archiving !== 'none' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>Archive</SectionLabel>
          {archiving === 'upgrade' ? (
            <ArchiveUpsell system={ARCHIVE_SYSTEM} bulk={bulk} onUpgrade={() => setUpgradeOpen(true)} />
          ) : (
          <ActionBox
            title={`Archive in ${ARCHIVE_SYSTEM}`}
            description={archiveDescription}
            action={
              <ButtonSecondary disabled={!folder || nothingToArchive} onClick={archive}>
                {bulk && toArchive.length > 0 ? `Archive ${plural(toArchive.length, 'document')}` : 'Archive'}
              </ButtonSecondary>
            }
            status={archiveStatus}
          >
            <Select
              name="archive-folder"
              label="Folder"
              isRequired
              value={folder}
              onChange={(value) => setFolder(String(value))}
              options={ARCHIVE_FOLDERS.map((f) => ({ label: f, value: f }))}
              placeholder="Choose a folder"
              hasSearch
              // Locked once any copy is archived: the rest go in the same folder.
              disabled={nothingToArchive || archivedEmployeeIds.length > 0}
              helper={bulk && archivedEmployeeIds.length > 0 && toArchive.length > 0 ? 'The remaining documents go in the same folder as those already archived' : undefined}
              helperMaxLines={2}
            />
          </ActionBox>
          )}
        </div>
        )}
      </div>
      {archiving === 'upgrade' && <UpgradeModal visible={upgradeOpen} onClose={() => setUpgradeOpen(false)} />}
    </Panel>
  )
}
