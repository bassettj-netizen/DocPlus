import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { ArchivedChip } from '../shared/DocumentsPage'
import DocumentForm from '../shared/DocumentForm'
import EditorLayout from '../shared/EditorLayout'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'
import ExportPanel from './ExportPanel'

// "Export panel" editor: Version 11's editor, with the "Export document"
// details in a panel that slides in from the right instead of a dialog.
// Save is always active; Export is disabled, with a tooltip, until changes
// are saved. Archiving from there makes the document read-only, with the
// Archived chip. Save is confirmed by a toast in the screen's top-right
// corner and "Changes saved" in the bar; Archive by its row in the panel.
//
// An archived document has Edit in place of Save. Edit unlocks the fields;
// the archived document itself never changes — saving ("Save as new
// version") creates a new, open copy of it, named "… (Copy)", and opens
// that with the same toast and "Changes saved".
export default function EditorPage() {
  // Keyed by document, so opening the new version starts a fresh editor.
  const { documentId } = useParams()
  return <DocumentEditor key={documentId} documentId={documentId} />
}

function DocumentEditor({ documentId }: { documentId: string | undefined }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { basePath } = useArchivingVersion()
  const { notification } = useNotifications()
  const editor = useDocumentEditor(documentId)
  // Toasts in the screen's top-right corner, over the navy bar, instead of
  // just below it as in the other versions (see index.css).
  useEffect(() => {
    document.body.classList.add('archiving-toasts-corner')
    return () => document.body.classList.remove('archiving-toasts-corner')
  }, [])
  const [exporting, setExporting] = useState(false)
  // Editing an archived document, after choosing Edit.
  const [editing, setEditing] = useState(false)
  // Set when this document was just created by "Save as new version".
  const createdAsVersion = (location.state as { newVersion?: boolean } | null)?.newVersion
  // "Changes saved" confirms a save made here, so a document opened from the
  // list doesn't show it until the user has changed and saved something.
  const [justSaved, setJustSaved] = useState(false)
  // Bumping the key remounts the panel, so each opening starts from its defaults.
  const [exportKey, setExportKey] = useState(0)

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const doc = editor.doc
  const employee = EMPLOYEES.find((e) => e.id === doc.employeeId)
  const template = TEMPLATES.find((t) => t.id === doc.templateId)
  const archived = !!doc.archivedAt
  const unsaved = editor.dirty || !!doc.unsaved
  const readOnly = exporting || (archived && !editing)

  const savedToast = () => notification.success({ title: 'Change saved!', placement: toastPlacements.TOP_RIGHT })

  const save = () => {
    editor.save()
    setJustSaved(true)
    savedToast()
  }

  const saveAsNewVersion = () => {
    const id = editor.saveAsNewVersion()
    if (!id) return
    savedToast()
    navigate(`${basePath}/documents/${id}`, { state: { newVersion: true } })
  }

  const cancelEditing = () => {
    editor.reset()
    setEditing(false)
  }

  const savedNote = (text: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
      <Typography as="span" color="neutral-lighten5">
        {text}
      </Typography>
    </span>
  )

  const exportButton = unsaved ? (
    // Below the bar, so it never covers Save.
    <Tooltip title={archived ? 'Save as a new version to export' : 'Save your changes to export'} placement={tooltipPlacements.BOTTOM_RIGHT}>
      <ButtonPrimary disabled>Export</ButtonPrimary>
    </Tooltip>
  ) : (
    <ButtonPrimary
      onClick={() => {
        setExportKey((key) => key + 1)
        setExporting(true)
      }}
    >
      Export
    </ButtonPrimary>
  )

  let actions
  if (archived && editing) {
    actions = (
      <>
        <ButtonSecondary onClick={cancelEditing}>Cancel</ButtonSecondary>
        <ButtonSecondary onClick={saveAsNewVersion}>Save as new version</ButtonSecondary>
        {exportButton}
      </>
    )
  } else if (archived) {
    actions = (
      <>
        {/* The same "Personio • date" chip as the Archived tab of the Documents list. */}
        <ArchivedChip date={doc.archivedAt!} label={ARCHIVE_SYSTEM} />
        <ButtonSecondary leftIcon={iconType.EditOutlined} onClick={() => setEditing(true)}>
          Edit
        </ButtonSecondary>
        {exportButton}
      </>
    )
  } else {
    actions = (
      <>
        {(justSaved || createdAsVersion) && !unsaved && savedNote('Changes saved')}
        <ButtonSecondary onClick={save}>Save</ButtonSecondary>
        {exportButton}
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
      <ExportPanel
        key={exportKey}
        visible={exporting}
        employeeName={employee ? employeeName(employee) : ''}
        documentName={editor.fields.title || doc.name}
        archived={archived}
        folder={doc.archiveFolder ?? template?.archiveCategory ?? ''}
        // A prototype: nothing is downloaded.
        onExport={() => {}}
        onArchive={editor.archive}
        onClose={() => setExporting(false)}
      />
    </EditorLayout>
  )
}
