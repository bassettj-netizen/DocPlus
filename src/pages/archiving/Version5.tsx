import { Navigate, Route, Routes } from 'react-router-dom'
import DocumentsPage from './shared/DocumentsPage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import EditorPage from './version4/EditorPage'

// One store per version, created once, so documents archived here survive
// navigating between screens but don't leak into the other version.
const store = createArchivingStore({ completedSeeds: true })
// Giulia Schmitt and the Fortbildungsvertrag — the pair the editor's preview
// and fields are written for.
const version = { basePath: '/archiving/version-5', archivedTab: false, hideUnsaved: true, newDocument: { employeeId: 'e10', templateId: 't10' } }

// "No setup steps" design: Export then archive without the Select an
// employee and Select a template screens. New document opens the editor
// straight away; everything from there on is the same editor.
// Documents list → editor → back to the Documents list.
export default function ArchivingV5() {
  return (
    <ArchivingStoreContext.Provider value={store}>
      <ArchivingVersionContext.Provider value={version}>
        <Routes>
          <Route path="/" element={<Navigate to="documents" replace />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="documents/:documentId" element={<EditorPage />} />
        </Routes>
      </ArchivingVersionContext.Provider>
    </ArchivingStoreContext.Provider>
  )
}
