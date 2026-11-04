import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
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
import { ARCHIVE_SYSTEM, formatDate } from '../shared/data'
import DocumentForm from '../shared/DocumentForm'
import EditorLayout from '../shared/EditorLayout'
import { isComplete, type DocumentFields } from '../shared/fields'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'

// "Export then archive": the updated Figma Archive button flow. Save only
// shows while there are unsaved changes or after choosing Edit on an
// archived document (otherwise "Changes saved"), and Archive only appears
// once the document has been exported — so what gets filed is what the user
// has already downloaded and checked. Export itself waits for the mandatory
// fields and a saved document. A new document isn't saved until the user
// clicks Save, which appears with their first change.
export default function EditorPage() {
  const { documentId } = useParams()
  const { basePath } = useArchivingVersion()
  const { notification } = useNotifications()
  const editor = useDocumentEditor(documentId)
  // An archived document opens read-only until the user chooses Edit.
  const [editing, setEditing] = useState(false)
  // Choosing Edit on an archived document asks for a Save before the next
  // export, even if nothing changes.
  const [savePending, setSavePending] = useState(false)
  // Whether Archive is on offer: once the current content has been
  // downloaded, or straight away for an existing, complete, unarchived
  // document. Any edit clears it until the next export.
  const [exported, setExported] = useState(() => !!editor.doc && !editor.doc.unsaved && !editor.doc.archivedAt && isComplete(editor.fields))

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const readOnly = !!editor.doc.archivedAt && !editing
  const complete = isComplete(editor.fields)
  const showSave = editor.dirty || savePending
  const unsaved = showSave || !!editor.doc.unsaved
  const exportBlocker = !complete ? 'Fill in the mandatory fields to export' : unsaved ? 'Save the document to export' : undefined

  const change = (fields: DocumentFields) => {
    editor.change(fields)
    setExported(false)
  }

  const save = () => {
    editor.save()
    setSavePending(false)
    notification.success({
      title: 'Change saved!',
      placement: toastPlacements.TOP_RIGHT,
    })
  }

  const archive = () => {
    editor.archive()
    setEditing(false)
    setExported(false)
    notification.success({
      title: `Document archived in ${ARCHIVE_SYSTEM}`,
      placement: toastPlacements.TOP_RIGHT,
    })
  }

  const actions = readOnly ? (
    <>
      {editor.doc.archivedAt && (
        <Chip
          label={`Archived • ${formatDate(editor.doc.archivedAt)}`}
          chipStyle={chipStyles.SEMANTIC_SUCCESS}
          leftIcon={iconType.CheckCircleOutlined}
          uppercase
        />
      )}
      <ButtonSecondary
        leftIcon={iconType.EditOutlined}
        onClick={() => {
          setEditing(true)
          setSavePending(true)
        }}
      >
        Edit
      </ButtonSecondary>
      <ButtonPrimary disabled>Archive</ButtonPrimary>
    </>
  ) : (
    <>
      {showSave ? (
        <ButtonSecondary onClick={save}>Save</ButtonSecondary>
      ) : (
        // An untouched new document has nothing to save, and isn't saved yet.
        !unsaved && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography as="span" color="neutral-lighten5">
              Changes saved
            </Typography>
          </span>
        )
      )}
      {exportBlocker ? (
        // Below the bar, so it never covers Save.
        <Tooltip title={exportBlocker} placement={tooltipPlacements.BOTTOM_RIGHT}>
          <ButtonPrimary disabled rightIcon={iconType.ChevronDownOutlined}>
            Export
          </ButtonPrimary>
        </Tooltip>
      ) : (
        <Dropdown
          items={[
            {
              key: 'pdf',
              label: 'Download PDF',
              onClick: () => setExported(true),
            },
            {
              key: 'word',
              label: 'Download to Word',
              onClick: () => setExported(true),
            },
          ]}
        >
          <ButtonPrimary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonPrimary>
        </Dropdown>
      )}
      {exported && <ButtonSecondary onClick={archive}>Archive</ButtonSecondary>}
    </>
  )

  return (
    <EditorLayout
      title={editor.fields.title || editor.doc.name}
      actions={actions}
      form={<DocumentForm fields={editor.fields} onChange={change} readOnly={readOnly} />}
    />
  )
}
