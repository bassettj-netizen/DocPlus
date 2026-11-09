import { Navigate, Route, Routes } from 'react-router-dom'
import SelectTemplatePage from './shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import DocumentsPage from './version11/DocumentsPage'
import BulkDocumentsPage from './version13/BulkDocumentsPage'
import EditorPage from './version13/EditorPage'
import SelectEmployeesPage from './version13/SelectEmployeesPage'

// Version 13's documents, without the archived ones or those shared with the user (sharing is an upgrade feature).
const store = createArchivingStore({ completedSeeds: true, bulkSeeds: true, noArchives: true, distinctNames: true })
const version = { basePath: '/archiving/version-14', archivedTab: false, hideUnsaved: true, massCreation: true, genericArchiveSystem: true, searchNameOnly: true, largeListDescription: true, scheduledDeletion: true, archiving: 'upgrade' as const, noSharing: true, noEmployee: true }

// "Archiving as upgrade": Version 13 for a plan without archiving, with its
// structure kept. The archiving parts — the Archived tabs and the Export
// panel's Archive section — carry the orange upgrade dot and open the
// "There's more you can do with HRD!" dialog instead, as features from a
// higher plan do in the live product; Upgrade sits in the side menu too.
export default function ArchivingV14() {
  return (
    <ArchivingStoreContext.Provider value={store}>
      <ArchivingVersionContext.Provider value={version}>
        <Routes>
          <Route path="/" element={<Navigate to="documents" replace />} />
          <Route path="documents" element={<DocumentsPage />} />
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
