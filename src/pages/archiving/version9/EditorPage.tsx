import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ButtonPrimary,
  ButtonSecondary,
  Chip,
  chipStyles,
  Dropdown,
  Icon,
  iconType,
  toastPlacements,
  Tooltip,
  tooltipPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { EMPLOYEES, employeeName, formatDate, TEMPLATES } from '../shared/data'
import DocumentForm from '../shared/DocumentForm'
import { isComplete } from '../shared/fields'
import EditorLayout from '../shared/EditorLayout'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'
import FinishModal, { type ExportFormat } from './FinishModal'

// "Finished header": Version 6 with Finish renamed Complete — Save only
// while there's something to save, and a Complete that waits for a saved,
// complete document and opens the "Complete document" dialog. Once the user
// has clicked Done there, the document opens read-only: if it was archived,
// with the Archived chip and Export; if not, with Complete again, which
// reopens the dialog so they can export or archive it.
export default function EditorPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { basePath } = useArchivingVersion()
  const { notification } = useNotifications()
  const editor = useDocumentEditor(documentId)
  const [finishing, setFinishing] = useState(false)
  // "Changes saved" confirms a save made here, so a document opened from the
  // list doesn't show it until the user has changed and saved something.
  const [justSaved, setJustSaved] = useState(false)
  // Bumping the key remounts the dialog, so each opening starts from its defaults.
  const [finishKey, setFinishKey] = useState(0)

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const doc = editor.doc
  const employee = EMPLOYEES.find((e) => e.id === doc.employeeId)
  const template = TEMPLATES.find((t) => t.id === doc.templateId)
  const complete = isComplete(editor.fields)
  const unsaved = editor.dirty || !!doc.unsaved
  const finishBlocker = !complete ? 'Fill in the mandatory fields to complete' : unsaved ? 'Save the document to complete' : undefined
  const done = !!doc.finishedAt || !!doc.archivedAt
  const readOnly = finishing || done

  const save = () => {
    editor.save()
    setJustSaved(true)
    notification.success({ title: 'Change saved!', placement: toastPlacements.TOP_RIGHT })
  }

  // A prototype: nothing is downloaded, the toast stands in for it.
  const exportAs = (format: ExportFormat) =>
    notification.success({ title: `Downloaded as ${format === 'pdf' ? 'PDF' : 'Word'}`, placement: toastPlacements.TOP_RIGHT })

  const exportButton = (
    <Dropdown
      items={[
        { key: 'pdf', label: 'Download to PDF', onClick: () => exportAs('pdf') },
        { key: 'word', label: 'Download to Word', onClick: () => exportAs('word') },
      ]}
    >
      <ButtonPrimary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonPrimary>
    </Dropdown>
  )

  const completeButton = (
    <ButtonPrimary
      onClick={() => {
        setFinishKey((key) => key + 1)
        setFinishing(true)
      }}
    >
      Complete
    </ButtonPrimary>
  )

  let actions
  if (doc.archivedAt) {
    actions = (
      <>
        <Chip label={`Archived • ${formatDate(doc.archivedAt)}`} chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.CheckCircleOutlined} uppercase />
        {exportButton}
      </>
    )
  } else if (doc.finishedAt) {
    actions = completeButton
  } else {
    actions = (
      <>
        {unsaved ? (
          <ButtonSecondary onClick={save}>Save</ButtonSecondary>
        ) : (
          justSaved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
              <Typography as="span" color="neutral-lighten5">
                Changes saved
              </Typography>
            </span>
          )
        )}
        {finishBlocker ? (
          // Below the bar, so it never covers Save.
          <Tooltip title={finishBlocker} placement={tooltipPlacements.BOTTOM_RIGHT}>
            <ButtonPrimary disabled>Complete</ButtonPrimary>
          </Tooltip>
        ) : (
          completeButton
        )}
      </>
    )
  }

  return (
    <EditorLayout
      title={editor.fields.title || doc.name}
      actions={actions}
      form={<DocumentForm fields={editor.fields} onChange={editor.change} readOnly={readOnly} />}
    >
      <FinishModal
        key={finishKey}
        visible={finishing}
        employeeName={employee ? employeeName(employee) : ''}
        documentName={editor.fields.title || doc.name}
        archiveCategory={template?.archiveCategory ?? ''}
        archived={!!doc.archivedAt}
        onExport={exportAs}
        onArchive={editor.archive}
        onClose={() => setFinishing(false)}
        onDone={() => {
          editor.finish()
          navigate(`${basePath}/documents`)
        }}
      />
    </EditorLayout>
  )
}
