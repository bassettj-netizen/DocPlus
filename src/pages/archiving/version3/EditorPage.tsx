import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonPrimary,
  ButtonSecondary,
  Chip,
  chipStyles,
  Dropdown,
  iconType,
  toastPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { ARCHIVE_SYSTEM, EMPLOYEES, employeeName, FLOW_STEPS, formatDate, TEMPLATES } from '../shared/data'
import DocumentForm from '../shared/DocumentForm'
import DocumentSummary from '../shared/DocumentSummary'
import EditorLayout from '../shared/EditorLayout'
import { isComplete } from '../shared/fields'
import FlowToolbar, { FlowSteps } from '../shared/FlowToolbar'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'

type EditorStep = 'fill' | 'export' | 'archive' | 'done'

// Each editor step's index in FLOW_STEPS; Employee and Template come before.
const STEP_INDEX: Record<EditorStep, number> = { fill: 2, export: 3, archive: 4, done: FLOW_STEPS.length }

type ExportFormat = 'pdf' | 'word'
const FORMAT_LABELS: Record<ExportFormat, string> = { pdf: 'PDF', word: 'Word' }

function ExportDropdown({ primary, label, onExport }: { primary: boolean; label: string; onExport: (format: ExportFormat) => void }) {
  const Button = primary ? ButtonPrimary : ButtonSecondary
  return (
    <Dropdown
      items={[
        { key: 'pdf', label: 'Download as PDF', onClick: () => onExport('pdf') },
        { key: 'word', label: 'Download as Word', onClick: () => onExport('word') },
      ]}
    >
      <Button rightIcon={iconType.ChevronDownOutlined}>{label}</Button>
    </Dropdown>
  )
}

// "Bottom toolbar": the header keeps only the way out and the title; every
// step and action lives in the toolbar along the bottom. The editor walks
// the user through Fill in → Export → Archive, in that order, so the
// document is checked and downloaded before it's filed and locked.
export default function EditorPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { basePath } = useArchivingVersion()
  const { notification } = useNotifications()
  const editor = useDocumentEditor(documentId)
  // An archived document reopens on its finished state, read-only.
  const [step, setStep] = useState<EditorStep>(() => (editor.doc?.archivedAt ? 'done' : 'fill'))
  // The formats downloaded since the fields last changed.
  const [exported, setExported] = useState<ExportFormat[]>([])

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const doc = editor.doc
  const employee = EMPLOYEES.find((e) => e.id === doc.employeeId)
  const template = TEMPLATES.find((t) => t.id === doc.templateId)
  const name = employee ? employeeName(employee) : ''
  const complete = isComplete(editor.fields)

  const exportAs = (format: ExportFormat) => {
    setExported((prev) => (prev.includes(format) ? prev : [...prev, format]))
    notification.success({ title: `Downloaded as ${FORMAT_LABELS[format]}`, placement: toastPlacements.TOP_RIGHT })
  }

  const continueToExport = () => {
    // A download from before these changes no longer matches the document.
    if (editor.dirty) setExported([])
    editor.save()
    setStep('export')
  }

  const archive = () => {
    editor.archive()
    setStep('done')
    notification.success({ title: `Archived in ${name}’s personnel file`, placement: toastPlacements.TOP_RIGHT })
  }

  const exportedChip = exported.length > 0 && (
    <Chip
      label={`Downloaded as ${exported.map((format) => FORMAT_LABELS[format]).join(' and ')}`}
      chipStyle={chipStyles.SEMANTIC_SUCCESS}
      leftIcon={iconType.CheckCircleOutlined}
    />
  )

  let left
  let right
  if (step === 'fill') {
    left = (
      <ButtonSecondary disabled={!editor.dirty} onClick={editor.save}>
        {editor.dirty ? 'Save draft' : 'Saved'}
      </ButtonSecondary>
    )
    right = (
      <>
        {!complete && (
          <Typography as="span" size="base-sm" color="neutral-darken2">
            Fill in the required fields to continue
          </Typography>
        )}
        <ButtonPrimary disabled={!complete} onClick={continueToExport}>
          Continue
        </ButtonPrimary>
      </>
    )
  } else if (step === 'export') {
    left = (
      <>
        <ButtonGhost onClick={() => setStep('fill')}>Back</ButtonGhost>
        {exportedChip}
      </>
    )
    right =
      exported.length === 0 ? (
        <>
          <ButtonGhost onClick={() => setStep('archive')}>Skip</ButtonGhost>
          <ExportDropdown primary label="Export" onExport={exportAs} />
        </>
      ) : (
        <>
          <ExportDropdown primary={false} label="Export" onExport={exportAs} />
          <ButtonPrimary onClick={() => setStep('archive')}>Continue</ButtonPrimary>
        </>
      )
  } else if (step === 'archive') {
    left = <ButtonGhost onClick={() => setStep('export')}>Back</ButtonGhost>
    right = <ButtonPrimary onClick={archive}>Archive</ButtonPrimary>
  } else {
    left = doc.archivedAt && (
      <Chip label={`Archived • ${formatDate(doc.archivedAt)}`} chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.CheckCircleOutlined} uppercase />
    )
    right = (
      <>
        <ButtonSecondary leftIcon={iconType.EditOutlined} onClick={() => setStep('fill')}>
          Edit
        </ButtonSecondary>
        <ExportDropdown primary={false} label="Export" onExport={exportAs} />
        <ButtonPrimary onClick={() => navigate(`${basePath}/documents`)}>Back to documents</ButtonPrimary>
      </>
    )
  }

  // The archive step swaps the fields for a check of what's being filed where.
  const form =
    step === 'archive' ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
        <Typography size="heading-md" weight="semibold">
          Archive document
        </Typography>
        <Typography color="neutral-darken2">
          {`A PDF copy is filed in ${name}’s personnel file in ${ARCHIVE_SYSTEM}. The document is then locked — you can still edit it later and archive the new version.`}
        </Typography>
        <DocumentSummary
          rows={[
            { label: 'Employee', value: name, strong: true },
            { label: 'Document', value: editor.fields.title || doc.name },
            { label: 'Category', value: template?.archiveCategory ?? '', note: '(set on the template)' },
            { label: 'Downloaded', value: exported.length > 0 ? exported.map((format) => FORMAT_LABELS[format]).join(', ') : 'Not exported' },
          ]}
        />
        {doc.archivedAt && (
          <Typography size="base-sm" color="neutral-darken2">
            {`An earlier version was archived on ${formatDate(doc.archivedAt)}. Archiving again adds this version alongside it.`}
          </Typography>
        )}
      </div>
    ) : (
      <DocumentForm fields={editor.fields} onChange={editor.change} readOnly={step !== 'fill'} />
    )

  return (
    <EditorLayout
      fields={editor.fields}
      title={editor.fields.title || doc.name}
      form={form}
      footer={<FlowToolbar left={left} center={<FlowSteps current={STEP_INDEX[step]} />} right={right} />}
    />
  )
}
