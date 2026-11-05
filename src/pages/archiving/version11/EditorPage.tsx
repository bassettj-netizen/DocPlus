import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
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
import ExportModal, { type ExportFormat } from './ExportModal'

// "Open and archived" editor: Version 9's header with Save always on show
// and always active, and Complete replaced by Export, which opens the
// "Export document" dialog — disabled, with a tooltip, until changes are saved. Archiving
// from there makes the document read-only, with the Archived chip.
export default function EditorPage() {
  const { documentId } = useParams()
  const { basePath } = useArchivingVersion()
  const { notification } = useNotifications()
  const editor = useDocumentEditor(documentId)
  const [exporting, setExporting] = useState(false)
  // "Changes saved" confirms a save made here, so a document opened from the
  // list doesn't show it until the user has changed and saved something.
  const [justSaved, setJustSaved] = useState(false)
  // Bumping the key remounts the dialog, so each opening starts from its defaults.
  const [exportKey, setExportKey] = useState(0)

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const doc = editor.doc
  const employee = EMPLOYEES.find((e) => e.id === doc.employeeId)
  const template = TEMPLATES.find((t) => t.id === doc.templateId)
  const archived = !!doc.archivedAt
  const unsaved = editor.dirty || !!doc.unsaved
  const readOnly = exporting || archived

  const save = () => {
    editor.save()
    setJustSaved(true)
    notification.success({ title: 'Change saved!', placement: toastPlacements.TOP_RIGHT })
  }

  // A prototype: nothing is downloaded, the toast stands in for it.
  const exportAs = (format: ExportFormat) =>
    notification.success({ title: `Downloaded as ${format === 'pdf' ? 'PDF' : 'Word'}`, placement: toastPlacements.TOP_RIGHT })

  const actions = (
    <>
      {archived ? (
        // The same "Personio • date" chip as the Archived tab of the Documents list.
        <ArchivedChip date={doc.archivedAt!} label={ARCHIVE_SYSTEM} />
      ) : (
        justSaved &&
        !unsaved && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography as="span" color="neutral-lighten5">
              Changes saved
            </Typography>
          </span>
        )
      )}
      <ButtonSecondary onClick={save}>Save</ButtonSecondary>
      {unsaved ? (
        // Below the bar, so it never covers Save.
        <Tooltip title="Save your changes to export" placement={tooltipPlacements.BOTTOM_RIGHT}>
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
      )}
    </>
  )

  return (
    <EditorLayout
      title={editor.fields.title || doc.name}
      actions={actions}
      form={<DocumentForm fields={editor.fields} onChange={editor.change} readOnly={readOnly} />}
    >
      <ExportModal
        key={exportKey}
        visible={exporting}
        employeeName={employee ? employeeName(employee) : ''}
        documentName={editor.fields.title || doc.name}
        archived={archived}
        folder={doc.archiveFolder ?? template?.archiveCategory ?? ''}
        onExport={exportAs}
        onArchive={editor.archive}
        onClose={() => setExporting(false)}
      />
    </EditorLayout>
  )
}
