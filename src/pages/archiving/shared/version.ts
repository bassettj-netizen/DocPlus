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
}

export const ArchivingVersionContext = createContext<ArchivingVersion>({ basePath: '/archiving/version-1', archivedTab: false })

export function useArchivingVersion() {
  return useContext(ArchivingVersionContext)
}
