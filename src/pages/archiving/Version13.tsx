import { Navigate, Route, Routes } from 'react-router-dom'
import SelectEmployeePage from './shared/SelectEmployeePage'
import SelectTemplatePage from './shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import DocumentsPage from './version11/DocumentsPage'
import BulkDocumentsPage from './version13/BulkDocumentsPage'
import EditorPage from './version13/EditorPage'
import SelectEmployeesPage from './version13/SelectEmployeesPage'

// Version 12's documents, plus three bulk documents for Mass creation: one
// open, one part-archived, one fully archived.
const store = createArchivingStore({ completedSeeds: true, sharedSeeds: true, bulkSeeds: true, distinctNames: true })
store.archive(store.getSnapshot()[1].id)
const version = { basePath: '/archiving/version-13', archivedTab: false, hideUnsaved: true, massCreation: true, genericArchiveSystem: true, searchNameOnly: true, largeListDescription: true, scheduledDeletion: true }

// "Bulk export" design: Version 12 plus Mass creation (the Figma bulk flow)
// — Documents splits into Individual and Mass creation in the side menu.
// Mass creation: pick several employees, pick a template, Create, then one
// editor for all of them. Both kinds of document share one Export panel:
// Version 12's Download + Archive panel, with the bulk design's choice of
// employees, separate or combined files, and file name folded in.
export default function ArchivingV13() {
  return (
    <ArchivingStoreContext.Provider value={store}>
      <ArchivingVersionContext.Provider value={version}>
        <Routes>
          <Route path="/" element={<Navigate to="documents" replace />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="new/employee" element={<SelectEmployeePage />} />
          <Route path="new/template" element={<SelectTemplatePage />} />
          <Route path="documents/:documentId" element={<EditorPage />} />
          <Route path="bulk" element={<BulkDocumentsPage />} />
          <Route path="bulk/new/employees" element={<SelectEmployeesPage />} />
          <Route path="bulk/new/template" element={<SelectTemplatePage bulk />} />
          <Route path="bulk/:documentId" element={<EditorPage bulk />} />
        </Routes>
      </ArchivingVersionContext.Provider>
    </ArchivingStoreContext.Provider>
  )
}
