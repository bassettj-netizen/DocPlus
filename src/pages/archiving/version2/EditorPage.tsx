import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ButtonPrimary, ButtonSecondary, Dropdown, iconType } from '@goat-ui/goat-ui-core'
import { EMPLOYEES, employeeName, TEMPLATES } from '../shared/data'
import DocumentForm from '../shared/DocumentForm'
import { isComplete } from '../shared/fields'
import EditorLayout from '../shared/EditorLayout'
import useDocumentEditor from '../shared/useDocumentEditor'
import { useArchivingVersion } from '../shared/version'
import FinishModal, { type FinishChoices } from './FinishModal'

// "Finish button": Finish stays disabled until the document is complete.
// Once it is, Export makes way for Finish, which locks the fields and opens
// the "Finish document" dialog with the next steps, archiving included.
export default function EditorPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { basePath } = useArchivingVersion()
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
  const readOnly = finishing || (!!doc.archivedAt && !editing)

  const handleFinish = (choices: FinishChoices) => {
    if (choices.archive) editor.archive()
    else editor.save()
    navigate(`${basePath}/documents`)
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
        <ButtonSecondary disabled={complete && !editor.dirty} onClick={editor.save}>
          Save
        </ButtonSecondary>
        {!complete && (
          <Dropdown
            items={[
              { key: 'pdf', label: 'Download as PDF' },
              { key: 'word', label: 'Download as Word' },
            ]}
          >
            <ButtonSecondary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonSecondary>
          </Dropdown>
        )}
        <ButtonPrimary disabled={!complete} onClick={startFinishing}>
          Finish
        </ButtonPrimary>
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
        onCancel={() => setFinishing(false)}
        onConfirm={handleFinish}
      />
    </EditorLayout>
  )
}
