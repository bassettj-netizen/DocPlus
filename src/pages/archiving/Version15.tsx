import { Navigate, Route, Routes } from 'react-router-dom'
import SelectEmployeePage from './shared/SelectEmployeePage'
import SelectTemplatePage from './shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from './shared/store'
import { ArchivingVersionContext } from './shared/version'
import DocumentsPage from './version11/DocumentsPage'
import BulkDocumentsPage from './version13/BulkDocumentsPage'
import EditorPage from './version13/EditorPage'
import SelectEmployeesPage from './version13/SelectEmployeesPage'

// Version 13's documents, without the archived ones.
const store = createArchivingStore({ completedSeeds: true, sharedSeeds: true, bulkSeeds: true, noArchives: true })
const version = { basePath: '/archiving/version-15', archivedTab: false, hideUnsaved: true, massCreation: true, genericArchiveSystem: true, searchNameOnly: true, largeListDescription: true, scheduledDeletion: true, archiving: 'none' as const }

// "No archiving": Version 13 for a plan without archiving, as if it didn't
// exist, changing as little as possible — no Open / Archived tabs (one list
// per page), no Archived progress column on Mass creation, and the Export
// panel only downloads.
export default function ArchivingV15() {
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
