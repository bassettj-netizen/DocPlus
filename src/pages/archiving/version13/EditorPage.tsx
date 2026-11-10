import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Banner,
  bannerStyles,
  bannerVariants,
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
import { ARCHIVE_SYSTEM, archivedCount, EMPLOYEES, TEMPLATES, type Employee } from '../shared/data'
import { ArchivedChip } from '../shared/DocumentsPage'
import DocumentForm from '../shared/DocumentForm'
import EditorLayout from '../shared/EditorLayout'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'
import ExportPanel from './ExportPanel'
import { UpgradeDot, UpgradeModal } from '../shared/Upgrade'
import SendEmailPanel, { type SendRequest } from '../../send-via-email/SendEmailPanel'

/** The Figma "Bulk documents" explainer at the top of the bulk editor. */
function BulkBanner({ count }: { count: number }) {
  return (
    <Banner
      variant={bannerVariants.INFO}
      bannerStyle={bannerStyles.SUBTLE}
      icon={iconType.InfoCircleFilled}
      header={`Bulk document for ${count} employees`}
      content={
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>The document structure will be the same for all employees.</li>
          <li>Values you enter are added to every employee’s document.</li>
          <li>Fields linked to employee master data are filled in for each employee.</li>
        </ul>
      }
    />
  )
}

// Version 12's editor, for both kinds of document. Save, Export (disabled
// until saved), archived documents read-only with Edit → "Save as new
// version" — all unchanged. What's new is the Export panel, now one panel
// for individual and bulk documents (see ExportPanel).
//
// A bulk document also gets the "Bulk documents" explainer and editor
// heading from the Figma bulk flow and —
// while only some of its copies are archived — "n of m archived" there.
// It only becomes read-only once every copy is archived.
export default function EditorPage({ bulk = false }: { bulk?: boolean }) {
  // Keyed by document, so opening the new version starts a fresh editor.
  const { documentId } = useParams()
  return <DocumentEditor key={documentId} documentId={documentId} bulk={bulk} />
}

function DocumentEditor({ documentId, bulk }: { documentId: string | undefined; bulk: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { basePath, archiving, sendViaEmail, noEmployee, liveEditorHeader } = useArchivingVersion()
  const { notification } = useNotifications()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const editor = useDocumentEditor(documentId)
  useEffect(() => {
    document.body.classList.add('archiving-toasts-corner')
    return () => document.body.classList.remove('archiving-toasts-corner')
  }, [])
  const [exporting, setExporting] = useState(false)
  const [editing, setEditing] = useState(false)
  const createdAsVersion = (location.state as { newVersion?: boolean } | null)?.newVersion
  const [justSaved, setJustSaved] = useState(false)
  const [exportKey, setExportKey] = useState(0)
  const [sending, setSending] = useState(false)
  const [sendKey, setSendKey] = useState(0)

  const listPath = bulk ? `${basePath}/bulk` : `${basePath}/documents`
  if (!editor.doc || !!editor.doc.employeeIds !== bulk) return <Navigate to={listPath} replace />

  const doc = editor.doc
  const employees = (doc.employeeIds ?? [doc.employeeId]).map((id) => EMPLOYEES.find((e) => e.id === id)).filter((e): e is Employee => !!e)
  const template = TEMPLATES.find((t) => t.id === doc.templateId)
  const archived = !!doc.archivedAt
  const partlyArchived = bulk && !archived ? archivedCount(doc) : 0
  const unsaved = editor.dirty || !!doc.unsaved
  // Send via email Version 1: Share and Export stay active with unsaved changes, and no "Changes saved" note.
  const liveHeader = !!liveEditorHeader && !bulk
  const actionsLocked = unsaved && !liveHeader
  const readOnly = exporting || (archived && !editing)
  const archivedEmployeeIds = bulk ? Object.keys(doc.archivedFor ?? {}) : archived ? [doc.employeeId] : []

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
    navigate(`${listPath}/${id}`, { state: { newVersion: true } })
  }

  const cancelEditing = () => {
    editor.reset()
    setEditing(false)
  }

  const savedNote = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
      <Typography as="span" color="neutral-lighten5">
        Changes saved
      </Typography>
    </span>
  )

  // Send via email: Export carries a chevron, as in its Figma header (Share doesn't).
  const exportChevron = liveHeader ? iconType.ChevronDownFilled : sendViaEmail && !bulk ? iconType.ChevronDownOutlined : undefined
  const exportButton = actionsLocked ? (
    <Tooltip title="Save your changes to export" placement={tooltipPlacements.BOTTOM_RIGHT}>
      <ButtonPrimary disabled rightIcon={exportChevron}>
        Export
      </ButtonPrimary>
    </Tooltip>
  ) : (
    <ButtonPrimary
      rightIcon={exportChevron}
      onClick={() => {
        setExportKey((key) => key + 1)
        setExporting(true)
      }}
    >
      Export
    </ButtonPrimary>
  )

  // Share sits just before Export and follows its rules: disabled, with the same kind of tooltip, while there are
  // unsaved changes. A prototype: nothing is shared yet. Version 14: an upgrade feature — the dot, and the upgrade dialog.
  const shareUpgrade = archiving === 'upgrade'
  // Send via email: Share opens the live product's menu, and its last item opens the Send via email panel. The
  // other items are there for the look; they don't do anything in this prototype.
  const shareMenu = !!sendViaEmail && !bulk
  const openSendEmail = () => {
    setSendKey((key) => key + 1)
    setSending(true)
  }
  // A prototype: nothing is sent. An address with "error" in it shows the error toast, so both outcomes can be demoed.
  const send = ({ addresses }: SendRequest) => {
    if (addresses.some((address) => address.toLowerCase().includes('error'))) {
      notification.error({ title: 'There was an issue with your request. Please try again.', placement: toastPlacements.TOP_RIGHT })
      return
    }
    setSending(false)
    notification.success({ title: addresses.length === 1 ? 'Email sent!' : 'Emails sent!', placement: toastPlacements.TOP_RIGHT })
  }
  const shareButton = actionsLocked ? (
    <Tooltip title="Save your changes to share" placement={tooltipPlacements.BOTTOM}>
      <span>{shareUpgrade ? <UpgradeDot><ButtonSecondary disabled>Share</ButtonSecondary></UpgradeDot> : <ButtonSecondary disabled>Share</ButtonSecondary>}</span>
    </Tooltip>
  ) : shareUpgrade ? (
    <UpgradeDot>
      <ButtonSecondary onClick={() => setUpgradeOpen(true)}>Share</ButtonSecondary>
    </UpgradeDot>
  ) : shareMenu ? (
    <Dropdown
      items={[
        { key: 'request-information', label: 'Request information' },
        { key: 'request-approval', label: 'Request approval' },
        { key: 'request-signature', label: 'Request signature' },
        { key: 'manage-access', label: 'Manage access' },
        { key: 'send-via-email', label: 'Send via email', onClick: openSendEmail },
      ]}
    >
      <ButtonSecondary rightIcon={liveHeader ? iconType.ChevronDownFilled : undefined}>Share</ButtonSecondary>
    </Dropdown>
  ) : (
    <ButtonSecondary onClick={() => {}}>Share</ButtonSecondary>
  )

  let actions
  if (archived && editing) {
    actions = (
      <>
        <ButtonSecondary onClick={cancelEditing}>Cancel</ButtonSecondary>
        {/* No Share or Export while editing an archived document: they come back on the new version once it's saved. */}
        <ButtonSecondary onClick={saveAsNewVersion}>Save as new version</ButtonSecondary>
      </>
    )
  } else if (archived) {
    actions = (
      <>
        <ArchivedChip date={doc.archivedAt!} label={ARCHIVE_SYSTEM} />
        <ButtonSecondary leftIcon={iconType.EditOutlined} onClick={() => setEditing(true)}>
          Edit
        </ButtonSecondary>
        {shareButton}
        {exportButton}
      </>
    )
  } else {
    actions = (
      <>
        {(justSaved || createdAsVersion) && !unsaved && !liveHeader && savedNote}
        {partlyArchived > 0 && (
          <Tooltip title={`Archived in ${ARCHIVE_SYSTEM} for ${partlyArchived} of ${employees.length} employees. Their copies won’t change when you save.`} placement={tooltipPlacements.BOTTOM}>
            <span>
              <Chip label={`${partlyArchived} of ${employees.length} archived`} chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.CheckCircleFilled} />
            </span>
          </Tooltip>
        )}
        <ButtonSecondary onClick={save}>Save</ButtonSecondary>
        {shareButton}
        {exportButton}
      </>
    )
  }

  return (
    <EditorLayout
      fields={editor.fields}
      title={editor.fields.title || doc.name}
      actions={actions}
      backPath={listPath}
      form={<DocumentForm fields={editor.fields} onChange={editor.change} readOnly={readOnly} archived={archived && !editing} bulk={bulk} banner={bulk && <BulkBanner count={employees.length} />} />}
    >
      <ExportPanel
        key={exportKey}
        visible={exporting}
        bulk={bulk}
        employees={employees}
        documentName={editor.fields.title || doc.name}
        archivedEmployeeIds={archivedEmployeeIds}
        // A bulk document's copies all go in one folder, so once some are archived the rest follow them there.
        folder={doc.archiveFolder ?? Object.values(doc.archivedFor ?? {})[0]?.folder ?? template?.archiveCategory ?? ''}
        // A prototype: nothing is downloaded.
        onDownload={() => {}}
        onArchive={(employeeIds, folder) => (bulk ? editor.archiveFor(employeeIds, folder) : editor.archive(folder))}
        onClose={() => setExporting(false)}
      />
      {shareMenu && <SendEmailPanel key={`send-${sendKey}`} visible={sending} employee={noEmployee ? undefined : employees[0]} onSend={send} onClose={() => setSending(false)} />}
      {shareUpgrade && <UpgradeModal visible={upgradeOpen} onClose={() => setUpgradeOpen(false)} />}
    </EditorLayout>
  )
}
