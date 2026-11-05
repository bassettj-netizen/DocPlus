import { Navigate, Route, Routes } from 'react-router-dom'
import SelectEmployeePage from './shared/SelectEmployeePage'
import SelectTemplatePage from './shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import DocumentsPage from './version11/DocumentsPage'
import EditorPage from './version12/EditorPage'

// One store per version, created once, so documents archived here survive
// navigating between screens but don't leak into the other versions. The
// list starts with the user's own documents plus three shared with them,
// with one of each already archived, so both tabs have something in them.
const store = createArchivingStore({ completedSeeds: true, sharedSeeds: true })
store.archive(store.getSnapshot()[1].id)
const version = { basePath: '/archiving/version-12', archivedTab: false, hideUnsaved: true }

// "Export panel" design: Version 11 exactly — same Documents list (reused),
// same editor — except Export opens the "Export document" details in a
// panel that slides in from the right instead of a dialog.
export default function ArchivingV12() {
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
