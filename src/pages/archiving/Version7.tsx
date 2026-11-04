import { Navigate, Route, Routes } from 'react-router-dom'
import DocumentsPage from './shared/DocumentsPage'
import SelectEmployeePage from './shared/SelectEmployeePage'
import SelectTemplatePage from './shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import EditorPage from './version7/EditorPage'

// One store per version, created once, so documents archived here survive
// navigating between screens but don't leak into the other version.
const store = createArchivingStore({ completedSeeds: true })
const version = { basePath: '/archiving/version-7', archivedTab: false, hideUnsaved: true, archiveSystemChip: true }

// "Archive with export" design: Version 4 with Archive offered alongside
// Export as soon as Export is active, instead of after a download. The
// listed documents are already complete, so they open ready to export or
// archive. Documents list → Select an employee → Select a template → editor
// → back to the Documents list.
export default function ArchivingV7() {
  return (
    <ArchivingStoreContext.Provider value={store}>
      <ArchivingVersionContext.Provider value={version}>
        <Routes>
          <Route path="/" element={<Navigate to="documents" replace />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="new/employee" element={<SelectEmployeePage />} />
          <Route path="new/template" element={<SelectTemplatePage />} />
          <Route path="documents/:documentId" element={<EditorPage />} />
        </Routes>
      </ArchivingVersionContext.Provider>
    </ArchivingStoreContext.Provider>
  )
}
