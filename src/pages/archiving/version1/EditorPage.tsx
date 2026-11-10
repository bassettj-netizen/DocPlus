import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ButtonPrimary, ButtonSecondary, Dropdown, iconType } from '@goat-ui/goat-ui-core'
import DocumentForm from '../shared/DocumentForm'
import EditorLayout from '../shared/EditorLayout'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'

// "Archive button": Archive sits next to Save and Export. Archiving locks
// the fields; the header then offers Edit (to unlock them) and a disabled
// Archive until something changes.
export default function EditorPage() {
  const { documentId } = useParams()
  const { basePath } = useArchivingVersion()
  const editor = useDocumentEditor(documentId)
  // An archived document opens read-only until the user chooses Edit.
  const [editing, setEditing] = useState(false)

  if (!editor.doc) return <Navigate to={`${basePath}/documents`} replace />

  const readOnly = !!editor.doc.archivedAt && !editing

  const actions = readOnly ? (
    <>
      <ButtonSecondary leftIcon={iconType.EditOutlined} onClick={() => setEditing(true)}>
        Edit
      </ButtonSecondary>
      <ButtonPrimary disabled>Archive</ButtonPrimary>
    </>
  ) : (
    <>
      <ButtonSecondary onClick={editor.save}>Save</ButtonSecondary>
      <Dropdown
        items={[
          { key: 'pdf', label: 'Download as PDF' },
          { key: 'word', label: 'Download as Word' },
        ]}
      >
        <ButtonSecondary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonSecondary>
      </Dropdown>
      <ButtonPrimary
        onClick={() => {
          editor.archive()
          setEditing(false)
        }}
      >
        Archive
      </ButtonPrimary>
    </>
  )

  return (
    <EditorLayout
      fields={editor.fields}
      title={editor.fields.title || editor.doc.name}
      actions={actions}
      form={<DocumentForm fields={editor.fields} onChange={editor.change} readOnly={readOnly} />}
    />
  )
}
