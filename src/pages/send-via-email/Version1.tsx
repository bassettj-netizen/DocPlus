import { Navigate, Route, Routes } from 'react-router-dom'
import SelectEmployeePage from '../archiving/shared/SelectEmployeePage'
import SelectTemplatePage from '../archiving/shared/SelectTemplatePage'
import { ArchivingStoreContext, createArchivingStore } from '../archiving/shared/store'
import { ArchivingVersionContext } from '../archiving/shared/version'
import DocumentsPage from './DocumentsPage'
import BulkDocumentsPage from '../archiving/version13/BulkDocumentsPage'
import EditorPage from '../archiving/version13/EditorPage'
import SelectEmployeesPage from '../archiving/version13/SelectEmployeesPage'

// Archiving Version 13's documents and screens, with the Figma "My documents" list in place of the Open / Archived
// one and the live product's side menu. Send via email is for individual documents; Mass creation is as in Version 13.
const store = createArchivingStore({ completedSeeds: true, sharedSeeds: true, bulkSeeds: true, distinctNames: true })
store.archive(store.getSnapshot()[1].id)
const version = {
  basePath: '/send-via-email/version-1',
  archivedTab: false,
  hideUnsaved: true,
  massCreation: true,
  genericArchiveSystem: true,
  searchNameOnly: true,
  largeListDescription: true,
  scheduledDeletion: true,
  sendViaEmail: true,
  adminMenu: true,
  massCreationDisabled: true,
  liveEditorHeader: true,
  optionalEmployee: true,
}

// "Send via email" (Figma Document editor › send via email): Archiving
// Version 13, plus Share → Send via email in an individual document's
// editor. The panel walks through Receiver (the employee, or other users),
// Email and Files, then shows "Email(s) sent!".
export default function SendViaEmailV1() {
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
