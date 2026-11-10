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
import { ARCHIVE_SYSTEM, EMPLOYEES, employeeName, TEMPLATES } from '../shared/data'
import DocumentForm from '../shared/DocumentForm'
import { isComplete } from '../shared/fields'
import EditorLayout from '../shared/EditorLayout'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'
import FinishModal from './FinishModal'

// "Done or archive": Version 6's editor — Save only while there's
// something to save, and a Finish that waits for a saved, complete
// document — with a Finish dialog that completes from a Done button's
// menu: Done, or Done and archive.
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
      fields={editor.fields}
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
        // A prototype: nothing is downloaded, the toast stands in for it.
        onExport={(format) => notification.success({ title: `Downloaded as ${format === 'pdf' ? 'PDF' : 'Word'}`, placement: toastPlacements.TOP_RIGHT })}
        onClose={() => setFinishing(false)}
        onDone={(archive) => {
          if (archive) {
            editor.archive()
            notification.success({ title: `Document archived in ${ARCHIVE_SYSTEM}`, placement: toastPlacements.TOP_RIGHT })
          }
          navigate(`${basePath}/documents`)
        }}
      />
    </EditorLayout>
  )
}
