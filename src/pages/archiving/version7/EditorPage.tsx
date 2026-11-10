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
import { ARCHIVE_SYSTEM, EMPLOYEES, employeeName, formatDate } from '../shared/data'
import DocumentForm from '../shared/DocumentForm'
import EditorLayout from '../shared/EditorLayout'
import { isComplete } from '../shared/fields'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'
import ArchiveModal from './ArchiveModal'

// "Archive with export": the "Export then archive" flow, except Archive
// appears as soon as Export becomes active — a saved document with every
// mandatory field filled in — rather than after a download. Save only shows
// while there are unsaved changes or after choosing Edit on an archived
// document; "Changes saved" only confirms a save made since opening it. A new document isn't saved until the
// user clicks Save, which appears with their first change. Archive explains
// what's about to happen in a dialog before filing anything.
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
  const [confirmingArchive, setConfirmingArchive] = useState(false)
  // "Changes saved" confirms a save made here, so a document opened from the
  // list doesn't show it until the user has changed and saved something.
  const [justSaved, setJustSaved] = useState(false)

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const readOnly = !!editor.doc.archivedAt && !editing
  const complete = isComplete(editor.fields)
  const showSave = editor.dirty || savePending
  const unsaved = showSave || !!editor.doc.unsaved
  const exportBlocker = !complete ? 'Fill in the mandatory fields to export' : unsaved ? 'Save the document to export' : undefined

  const save = () => {
    setSavePending(false)
    // Saving an archived document without changing anything leaves it as
    // filed: back to the Archived chip, Edit and Export.
    if (editor.doc?.archivedAt && !editor.dirty) {
      setEditing(false)
      return
    }
    editor.save()
    setJustSaved(true)
    notification.success({
      title: 'Change saved!',
      placement: toastPlacements.TOP_RIGHT,
    })
  }

  const employee = EMPLOYEES.find((e) => e.id === editor.doc?.employeeId)

  const archive = () => {
    setConfirmingArchive(false)
    editor.archive()
    setEditing(false)
    notification.success({
      title: `Document archived in ${ARCHIVE_SYSTEM}`,
      placement: toastPlacements.TOP_RIGHT,
    })
  }

  const exportMenu = (
    <Dropdown
      items={[
        {
          key: 'pdf',
          label: 'Download PDF',
          onClick: () => notification.success({ title: 'Downloaded as PDF', placement: toastPlacements.TOP_RIGHT }),
        },
        {
          key: 'word',
          label: 'Download to Word',
          onClick: () => notification.success({ title: 'Downloaded as Word', placement: toastPlacements.TOP_RIGHT }),
        },
      ]}
    >
      <ButtonPrimary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonPrimary>
    </Dropdown>
  )

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
      {/* What was filed can still be downloaded. */}
      {exportMenu}
    </>
  ) : (
    <>
      {showSave ? (
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
      {exportBlocker ? (
        // Below the bar, so it never covers Save.
        <Tooltip title={exportBlocker} placement={tooltipPlacements.BOTTOM_RIGHT}>
          <ButtonPrimary disabled rightIcon={iconType.ChevronDownOutlined}>
            Export
          </ButtonPrimary>
        </Tooltip>
      ) : (
        exportMenu
      )}
      {/* Ready to export means ready to archive. */}
      {!exportBlocker && <ButtonSecondary onClick={() => setConfirmingArchive(true)}>Archive</ButtonSecondary>}
    </>
  )

  return (
    <EditorLayout
      fields={editor.fields}
      title={editor.fields.title || editor.doc.name}
      actions={actions}
      form={<DocumentForm fields={editor.fields} onChange={editor.change} readOnly={readOnly} />}
    >
      <ArchiveModal
        visible={confirmingArchive}
        employeeName={employee ? employeeName(employee) : ''}
        documentName={editor.fields.title || editor.doc.name}
        previouslyArchivedAt={editor.doc.archivedAt}
        onCancel={() => setConfirmingArchive(false)}
        onConfirm={archive}
      />
    </EditorLayout>
  )
}
