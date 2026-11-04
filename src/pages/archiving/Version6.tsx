import { Navigate, Route, Routes } from 'react-router-dom'
import DocumentsPage from './shared/DocumentsPage'
import SelectEmployeePage from './shared/SelectEmployeePage'
import SelectTemplatePage from './shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import EditorPage from './version6/EditorPage'

// One store per version, created once, so documents archived here survive
// navigating between screens but don't leak into the other version.
const store = createArchivingStore()
const version = { basePath: '/archiving/version-6', archivedTab: true, hideUnsaved: true }

// "Finish when saved" design: the Finish button design with a simpler
// header — Save (only while there's something to save) or "Changes saved",
// and a Finish that waits for a saved, complete document. Like Export then
// archive, a new document is only listed once it has been saved.
// Documents list → Select an employee → Select a template → editor → back
// to the Documents list.
export default function ArchivingV6() {
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
