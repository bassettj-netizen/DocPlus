import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ButtonPrimary,
  ButtonSecondary,
  Icon,
  iconType,
  toastPlacements,
  Tooltip,
  tooltipPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { EMPLOYEES, employeeName, TEMPLATES } from '../shared/data'
import DocumentForm from '../shared/DocumentForm'
import { isComplete } from '../shared/fields'
import EditorLayout from '../shared/EditorLayout'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'
import FinishModal from './FinishModal'

// "Finish when saved": the Finish button design, with the header reduced to
// Save and Finish. Save only shows while there's something to save — a new
// document, or unsaved changes — and otherwise makes way for "Changes
// saved". Finish waits for a saved document with every mandatory field
// filled in, then opens a "Finish document" dialog where the user can
// export and archive separately.
export default function EditorPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { basePath } = useArchivingVersion()
  const { notification } = useNotifications()
  const editor = useDocumentEditor(documentId)
  const [finishing, setFinishing] = useState(false)
  // A finished (archived) document opens read-only until the user chooses Edit.
  const [editing, setEditing] = useState(false)
  // Bumping the key remounts the dialog, so each opening starts from its defaults.
  const [finishKey, setFinishKey] = useState(0)

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const doc = editor.doc
  const employee = EMPLOYEES.find((e) => e.id === doc.employeeId)
  const template = TEMPLATES.find((t) => t.id === doc.templateId)
  const complete = isComplete(editor.fields)
  const unsaved = editor.dirty || !!doc.unsaved
  const finishBlocker = !complete ? 'Fill in the mandatory fields to finish' : unsaved ? 'Save the document to finish' : undefined
  const readOnly = finishing || (!!doc.archivedAt && !editing)

  const save = () => {
    editor.save()
    notification.success({ title: 'Change saved!', placement: toastPlacements.TOP_RIGHT })
  }

  let actions
  if (readOnly) {
    actions = (
      <>
        <ButtonSecondary
          leftIcon={iconType.EditOutlined}
          onClick={() => {
            setFinishing(false)
            setEditing(true)
          }}
        >
          Edit
        </ButtonSecondary>
        <ButtonPrimary disabled>Finish</ButtonPrimary>
      </>
    )
  } else {
    const startFinishing = () => {
      setFinishKey((key) => key + 1)
      setFinishing(true)
    }
    actions = (
      <>
        {unsaved ? (
          <ButtonSecondary onClick={save}>Save</ButtonSecondary>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography as="span" color="neutral-lighten5">
              Changes saved
            </Typography>
          </span>
        )}
        {finishBlocker ? (
          // Below the bar, so it never covers Save.
          <Tooltip title={finishBlocker} placement={tooltipPlacements.BOTTOM_RIGHT}>
            <ButtonPrimary disabled>Finish</ButtonPrimary>
          </Tooltip>
        ) : (
          <ButtonPrimary onClick={startFinishing}>Finish</ButtonPrimary>
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
        // Editing an archived document makes a new version worth archiving.
        archived={!!doc.archivedAt && !editing}
        // A prototype: nothing is downloaded, the toast stands in for it.
        onExport={(format) => notification.success({ title: `Downloaded as ${format === 'pdf' ? 'PDF' : 'Word'}`, placement: toastPlacements.TOP_RIGHT })}
        onArchive={() => {
          editor.archive()
          setEditing(false)
        }}
        onClose={() => setFinishing(false)}
        onDone={() => navigate(`${basePath}/documents`)}
      />
    </EditorLayout>
  )
}
