import { Navigate, Route, Routes } from 'react-router-dom'
import DocumentsPage from './shared/DocumentsPage'
import SelectEmployeePage from './shared/SelectEmployeePage'
import SelectTemplatePage from './shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import EditorPage from './version10/EditorPage'

// One store per version, created once, so documents archived here survive
// navigating between screens but don't leak into the other version. The
// listed documents start in every status: two ready to complete, one draft
// (the third, saved part-way), and one already archived.
const store = createArchivingStore({ completedSeeds: true })
store.archive(store.getSnapshot()[1].id)
const version = { basePath: '/archiving/version-10', archivedTab: false, hideUnsaved: true, statusColumn: true }

// "Auto-archive on Done" design: Version 9, except completing a document
// archives it — Done in the Complete dialog files it in Personio — and the
// Documents list has a Status column (Draft, Ready to complete, Archived in
// Personio) in place of Archived. Documents list → Select an employee →
// Select a template → editor → back to the Documents list.
export default function ArchivingV10() {
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
