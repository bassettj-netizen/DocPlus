import { Navigate, Route, Routes } from 'react-router-dom'
import DocumentsPage from './shared/DocumentsPage'
import SelectEmployeePage from './shared/SelectEmployeePage'
import SelectTemplatePage from './shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import EditorPage from './version9/EditorPage'

// One store per version, created once, so documents archived here survive
// navigating between screens but don't leak into the other version.
const store = createArchivingStore()
const version = { basePath: '/archiving/version-9', archivedTab: false, hideUnsaved: true, archiveSystemChip: true }

// "Finished header" design: Version 6 with Finish renamed Complete. A
// document completed with Done reopens with the Archived chip and Export if
// it was archived, or with Complete again (reopening the dialog) if not.
// Documents list → Select an employee → Select a template → editor → back
// to the Documents list.
export default function ArchivingV9() {
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
