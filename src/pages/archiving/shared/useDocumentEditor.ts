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
    archive() {
      if (!doc) return
      store.save(doc.id, fields)
      store.archive(doc.id)
      setDirty(false)
    },
  }
}
