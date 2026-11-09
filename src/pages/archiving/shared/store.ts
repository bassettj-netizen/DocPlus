import { createContext, useContext, useSyncExternalStore } from 'react'
import { createBulkSeedDocuments, createSeedDocuments, newDocumentId, TEMPLATES, type HrdDocument } from './data'
import type { DocumentFields } from './fields'

// Same minimal module-level store + pub/sub as the other prototypes, but
// built by a factory: each Archiving version gets its own documents, so
// archiving something in one version doesn't change the other.
// `noArchives` (Versions 14 and 15, a plan without archiving): leaves out the seeds that are archived, and clears
// the archived copies of the part-archived bulk document.
// `distinctNames` (Version 13): gives every seed document its own name.
export function createArchivingStore({ completedSeeds = false, sharedSeeds = false, bulkSeeds = false, noArchives = false, distinctNames = false } = {}) {
  const seeds: HrdDocument[] = [
    ...createSeedDocuments({ completed: completedSeeds, shared: sharedSeeds, distinctNames }),
    ...(bulkSeeds ? createBulkSeedDocuments() : []),
  ]
  let documents: HrdDocument[] = noArchives ? seeds.filter((doc) => !doc.archivedAt).map((doc) => ({ ...doc, archivedFor: undefined })) : seeds
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

    /** A bulk document (Mass creation): one document, one copy per employee. */
    createBulkDocument(employeeIds: string[], templateId: string) {
      const now = new Date()
      const doc: HrdDocument = {
        id: newDocumentId(),
        name: TEMPLATES.find((t) => t.id === templateId)?.name ?? 'Untitled document',
        employeeId: employeeIds[0],
        employeeIds,
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

    /** Saves edits to an archived document as a new, unarchived version of it, named "… (Copy)" — the archived one is left as it was. Returns the new id. */
    createVersion(id: string, fields: DocumentFields) {
      const source = documents.find((doc) => doc.id === id)
      if (!source) return undefined
      const root = source.versionOf ?? source.id
      const latest = Math.max(...documents.filter((doc) => (doc.versionOf ?? doc.id) === root).map((doc) => doc.version ?? 1))
      const now = new Date()
      // A copy of a copy is still just "(Copy)", not "(Copy) (Copy)".
      const name = `${(fields.title || source.name).replace(/ \(Copy\)$/, '')} (Copy)`
      const doc: HrdDocument = {
        id: newDocumentId(),
        name,
        employeeId: source.employeeId,
        templateId: source.templateId,
        createdAt: now,
        modifiedAt: now,
        fields: { ...fields, title: name },
        // A bulk document's new version is for the same employees, none of them archived yet.
        ...(source.employeeIds && { employeeIds: source.employeeIds }),
        version: latest + 1,
        versionOf: root,
      }
      update([doc, ...documents])
      return doc.id
    },

    finish(id: string) {
      update(documents.map((doc) => (doc.id === id ? { ...doc, finishedAt: new Date() } : doc)))
    },

    /** Archives a bulk document's copies for these employees. Once every copy is archived, so is the document. */
    archiveFor(id: string, employeeIds: string[], folder: string) {
      const now = new Date()
      update(
        documents.map((doc) => {
          if (doc.id !== id || !doc.employeeIds) return doc
          const archivedFor = { ...doc.archivedFor }
          employeeIds.forEach((employeeId) => {
            archivedFor[employeeId] ??= { at: now, folder }
          })
          const all = doc.employeeIds.every((employeeId) => archivedFor[employeeId])
          return { ...doc, archivedFor, ...(all && { archivedAt: now, archiveFolder: folder }) }
        }),
      )
    },

    archive(id: string, folder?: string) {
      update(documents.map((doc) => (doc.id === id ? { ...doc, archivedAt: new Date(), ...(folder && { archiveFolder: folder }) } : doc)))
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
