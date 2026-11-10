import { Navigate, Route, Routes } from 'react-router-dom'
import SelectTemplatePage from '../archiving/shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from '../archiving/shared/store'
import { ArchivingVersionContext } from '../archiving/shared/version'
import DocumentsPage from './DocumentsPage'
import BulkDocumentsPage from '../archiving/version13/BulkDocumentsPage'
import EditorPage from '../archiving/version13/EditorPage'
import SelectEmployeesPage from '../archiving/version13/SelectEmployeesPage'

const store = createArchivingStore({ completedSeeds: true, sharedSeeds: true, bulkSeeds: true, distinctNames: true })
store.archive(store.getSnapshot()[1].id)
const version = {
  basePath: '/send-via-email/version-2',
  archivedTab: false,
  hideUnsaved: true,
  massCreation: true,
  genericArchiveSystem: true,
  searchNameOnly: true,
  largeListDescription: true,
  scheduledDeletion: true,
  sendViaEmail: true,
  adminMenu: true,
  noEmployee: true,
}

// "No employee" (Figma "When no employee is selected"): Version 1 with
// documents that have no employee, as in Archiving Version 14 — New document
// goes straight to the templates and the list has no Employee column. Send via
// email skips the Receiver step: Email, then Files.
export default function SendViaEmailV2() {
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
