import { createContext, useContext, useSyncExternalStore } from 'react'
import { createSeedDocuments, newDocumentId, TEMPLATES, type HrdDocument } from './data'
import type { DocumentFields } from './fields'

// Same minimal module-level store + pub/sub as the other prototypes, but
// built by a factory: each Archiving version gets its own documents, so
// archiving something in one version doesn't change the other.
export function createArchivingStore({ completedSeeds = false } = {}) {
  let documents: HrdDocument[] = createSeedDocuments({ completed: completedSeeds })
  const listeners = new Set<() => void>()

  const update = (next: HrdDocument[]) => {
    documents = next
    listeners.forEach((listener) => listener())
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot() {
      return documents
    },

    createDocument(employeeId: string, templateId: string) {
      const now = new Date()
      const doc: HrdDocument = {
        id: newDocumentId(),
        name: TEMPLATES.find((t) => t.id === templateId)?.name ?? 'Untitled document',
        employeeId,
        templateId,
        createdAt: now,
        modifiedAt: now,
        unsaved: true,
      }
      update([doc, ...documents])
      return doc.id
    },

    save(id: string, fields: DocumentFields) {
      update(documents.map((doc) => (doc.id === id ? { ...doc, fields, name: fields.title || doc.name, modifiedAt: new Date(), unsaved: false } : doc)))
    },

    finish(id: string) {
      update(documents.map((doc) => (doc.id === id ? { ...doc, finishedAt: new Date() } : doc)))
    },

    archive(id: string) {
      update(documents.map((doc) => (doc.id === id ? { ...doc, archivedAt: new Date() } : doc)))
    },
  }
}

export type ArchivingStore = ReturnType<typeof createArchivingStore>

export const ArchivingStoreContext = createContext<ArchivingStore | null>(null)

export function useArchivingStore() {
  const store = useContext(ArchivingStoreContext)
  if (!store) throw new Error('useArchivingStore must be used inside an Archiving version')
  return store
}

export function useDocuments() {
  const store = useArchivingStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}

export function useDocument(id: string | undefined) {
  return useDocuments().find((doc) => doc.id === id)
}
