import { createContext, useContext } from 'react'

export interface ArchivingVersion {
  /** The version's route prefix, e.g. /archiving/version-1 — shared screens link relative to it. */
  basePath: string
  /** The Finish button design adds an "Archived" tab to the Documents list (once something is archived); the Archive button design doesn't. */
  archivedTab: boolean
  /** The Bottom toolbar design shows the steps, and every editor action, in the toolbar at the bottom of the screen. */
  stepsToolbar?: boolean
  /** The Export then archive design only lists a new document once it has been saved. */
  hideUnsaved?: boolean
  /** The Documents list's Archived chip names the system the document was archived to (e.g. "Personio • 04/11/2026") instead of "Archived". */
  archiveSystemChip?: boolean
  /** The Auto-archive design replaces the Archived column with a Status column: Draft, Ready to complete, or Archived in the HR system. */
  statusColumn?: boolean
  /** The No setup steps design skips picking an employee and template: New document opens the editor on this pair straight away. */
  newDocument?: { employeeId: string; templateId: string }
  /** The Bulk export design splits Documents into Individual and Mass creation in the side menu. */
  massCreation?: boolean
  /** Users choose their HR system (Version 13): descriptions and hints say "your HR system" instead of naming it. */
  genericArchiveSystem?: boolean
  /** The Documents list's search matches the document name only, not the employee (Version 13). */
  searchNameOnly?: boolean
  /** The description under the Documents list's heading at base size rather than base-sm (Version 13). */
  largeListDescription?: boolean
  /** The deletion column reads "Scheduled deletion" (not "Deleted on") and its tooltip "Will be deleted…", so the date
   *  reads as upcoming rather than past (Version 13). */
  scheduledDeletion?: boolean
  /** Versions 14 and 15: Version 13 for a plan without archiving. 'upgrade' keeps the archiving UI, marked with the
   *  orange upgrade dot, and opens the upgrade dialog instead of archiving; 'none' leaves archiving out altogether. */
  archiving?: 'upgrade' | 'none'
  /** Versions 13 and 14: the Documents list's heading reads "Documents" instead of "Choose a new or existing document". */
  documentsHeading?: boolean
  /** Version 13: the Mass creation list's heading reads "Documents" too, instead of "Mass creation". */
  bulkDocumentsHeading?: boolean
  /** Version 14: sharing is an upgrade feature, so no documents are shared with the user — no Owner column, and the
   *  list's description doesn't mention shared documents. */
  noSharing?: boolean
  /** Version 14: picking an employee is an upgrade feature — New document goes straight to the templates, the
   *  Documents list has no Employee column, and individual documents are exported without one. */
  noEmployee?: boolean
  /** Send via email: the individual editor's Share button opens a menu (Request information, …, Send via email), and
   *  Send via email opens a side panel — Receiver, Email, Files — that ends in an "Email(s) sent!" toast. */
  sendViaEmail?: boolean
  /** Send via email: Admin opens a submenu in the side menu, as in the live product (decorative here). */
  adminMenu?: boolean
  /** Send via email Version 1: Mass creation is in the side menu, styled as usual, but doesn't link anywhere. */
  massCreationDisabled?: boolean
  /** Send via email Version 1: the individual editor's header as in the live product — Share and Export always
   *  active (even with unsaved changes), both with a filled chevron, and no "Changes saved" note. */
  liveEditorHeader?: boolean
  /** Send via email: picking an employee is optional — Continue is active with none selected, and the document is
   *  created without one (Send via email then skips its Receiver step, as in "No employee"). */
  optionalEmployee?: boolean
}

export const ArchivingVersionContext = createContext<ArchivingVersion>({ basePath: '/archiving/version-1', archivedTab: false })

export function useArchivingVersion() {
  return useContext(ArchivingVersionContext)
}
