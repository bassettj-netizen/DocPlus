import { useState } from 'react'
import { emptyFields, type DocumentFields } from './fields'
import { useArchivingStore, useDocument } from './store'

// The editor's working copy of a document's fields, plus whether it differs
// from what was last saved. Both versions' editors build on this.
export default function useDocumentEditor(documentId: string | undefined) {
  const store = useArchivingStore()
  const doc = useDocument(documentId)
  const [fields, setFields] = useState<DocumentFields>(() => doc?.fields ?? emptyFields(doc?.name ?? ''))
  const [dirty, setDirty] = useState(false)

  return {
    doc,
    fields,
    dirty,
    change(next: DocumentFields) {
      setFields(next)
      setDirty(true)
    },
    /** Throws away unsaved changes, back to the last saved fields. */
    reset() {
      setFields(doc?.fields ?? emptyFields(doc?.name ?? ''))
      setDirty(false)
    },
    /** Saves the fields as a new version of this document (see the store's createVersion); returns its id. */
    saveAsNewVersion() {
      if (!doc) return undefined
      const id = store.createVersion(doc.id, fields)
      setDirty(false)
      return id
    },
    save() {
      if (!doc) return
      store.save(doc.id, fields)
      setDirty(false)
    },
    finish() {
      if (!doc) return
      store.save(doc.id, fields)
      store.finish(doc.id)
      setDirty(false)
    },
    archive(folder?: string) {
      if (!doc) return
      store.save(doc.id, fields)
      store.archive(doc.id, folder)
      setDirty(false)
    },
  }
}
