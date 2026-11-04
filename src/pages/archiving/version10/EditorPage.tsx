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
import { ARCHIVE_SYSTEM, EMPLOYEES, employeeName, formatDate } from '../shared/data'
import DocumentForm from '../shared/DocumentForm'
import { isComplete } from '../shared/fields'
import EditorLayout from '../shared/EditorLayout'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'
import CompleteModal, { type ExportFormat } from './CompleteModal'

// "Auto-archive on Done": Version 9's editor — Save only while there's
// something to save, and a Complete that waits for a saved, complete
// document — but completing and archiving are one step. Done in the
// Complete dialog archives the document and returns to the list, where its
// status reads Archived in Personio; reopened, it shows the Archived chip and
// Export.
export default function EditorPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { basePath } = useArchivingVersion()
  const { notification } = useNotifications()
  const editor = useDocumentEditor(documentId)
  const [completing, setCompleting] = useState(false)
  // "Changes saved" confirms a save made here, so a document opened from the
  // list doesn't show it until the user has changed and saved something.
  const [justSaved, setJustSaved] = useState(false)
  // Bumping the key remounts the dialog, so each opening starts from its defaults.
  const [completeKey, setCompleteKey] = useState(0)

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const doc = editor.doc
  const employee = EMPLOYEES.find((e) => e.id === doc.employeeId)
  const complete = isComplete(editor.fields)
  const unsaved = editor.dirty || !!doc.unsaved
  const completeBlocker = !complete ? 'Fill in the mandatory fields to complete' : unsaved ? 'Save the document to complete' : undefined
  const readOnly = completing || !!doc.archivedAt

  const save = () => {
    editor.save()
    setJustSaved(true)
    notification.success({ title: 'Change saved!', placement: toastPlacements.TOP_RIGHT })
  }

  // A prototype: nothing is downloaded, the toast stands in for it.
  const exportAs = (format: ExportFormat) =>
    notification.success({ title: `Downloaded as ${format === 'pdf' ? 'PDF' : 'Word'}`, placement: toastPlacements.TOP_RIGHT })

  const done = () => {
    editor.archive()
    // Shown on the Documents list, where a top-right toast would cover New document.
    notification.success({ title: `Document completed and archived in ${ARCHIVE_SYSTEM}`, placement: toastPlacements.BOTTOM_RIGHT })
    navigate(`${basePath}/documents`)
  }

  let actions
  if (doc.archivedAt) {
    actions = (
      <>
        <Chip label={`Archived • ${formatDate(doc.archivedAt)}`} chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.CheckCircleOutlined} uppercase />
        <Dropdown
          items={[
            { key: 'pdf', label: 'Download to PDF', onClick: () => exportAs('pdf') },
            { key: 'word', label: 'Download to Word', onClick: () => exportAs('word') },
          ]}
        >
          <ButtonPrimary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonPrimary>
        </Dropdown>
      </>
    )
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
        {completeBlocker ? (
          // Below the bar, so it never covers Save.
          <Tooltip title={completeBlocker} placement={tooltipPlacements.BOTTOM_RIGHT}>
            <ButtonPrimary disabled>Complete</ButtonPrimary>
          </Tooltip>
        ) : (
          <ButtonPrimary
            onClick={() => {
              setCompleteKey((key) => key + 1)
              setCompleting(true)
            }}
          >
            Complete
          </ButtonPrimary>
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
      <CompleteModal
        key={completeKey}
        visible={completing}
        employeeName={employee ? employeeName(employee) : ''}
        documentName={editor.fields.title || doc.name}
        onExport={exportAs}
        onCancel={() => setCompleting(false)}
        onDone={done}
      />
    </EditorLayout>
  )
}
