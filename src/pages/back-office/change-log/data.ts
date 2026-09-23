import { chipStyles } from '@goat-ui/goat-ui-core'
import type { ChipStyleValue } from '@goat-ui/goat-ui-core'

// Mock data for Back Office → Change Log, transcribed from the "Change Log"
// section of the Templates management Figma file. Unlike Legal Changes (which
// only tracks legal-amendment reviews), this log records every publishing
// action against a template — legal or otherwise — in one place.

export type ChangeReason = 'Legal Update' | 'Other'
export type ChangeType = 'Update' | 'Publish' | 'Import'
export type ChangeStatus = 'scheduled' | 'published' | 'discarded'

export interface ChangeLogEntry {
  id: string
  templateName: string
  haufeIndex: string
  changeType: ChangeType
  changeReason: ChangeReason
  /** Shown as both the table's "Change Date" column and the panel's "Update date" field. */
  changeDate: string
  status: ChangeStatus
  originalTemplateId: string
  updatedTemplateId: string
  author: string
  folder: string
  /** Legal-reason entries only — the design panel has no Source/notification fields for "Other". */
  source?: string
  legalUpdate?: string
  changeNotification?: string
}

const LEGAL_UPDATE_TEXT =
  'Salary range must be visible in the job posting (§X EntgTranspG amendment). Pay ranges will be ' +
  'mandatorily documented for all positions starting June 1, 2026, and disclosed on request to ' +
  'applicants and employees (Art. 5, 2023/970/EU). Gender-based pay differences greater than 5% ' +
  'within a pay grade must be justified and documented under § 12 EntgTranspG. Employers with 100+ ' +
  "employees must report the gender pay gap yearly, and disclose individual pay data within 30 days " +
  "of each employee's request."

const CHANGE_NOTIFICATION_TEXT =
  'Salary range must be visible in the job posting (§X EntgTranspG amendment). Pay ranges will be ' +
  'mandatorily documented for all positions starting June 1, 2026'

interface SeedRow {
  templateName: string
  haufeIndex: string
  changeType: ChangeType
  changeReason: ChangeReason
  changeDate: string
  status: ChangeStatus
  originalTemplateId: string
  author: string
  folder: string
}

const SEED_ROWS: SeedRow[] = [
  {
    // These first nine entries used to share the exact template names shown
    // in Legal Changes' own pending list (e.g. "Abrufarbeit,
    // Rahmenvereinbarung"), making the two lists look like duplicates of one
    // another rather than two distinct sets of templates — so they're
    // deliberately different documents here.
    templateName: 'Zeugnis, einfaches Arbeitszeugnis',
    haufeIndex: 'HI210556',
    changeType: 'Update',
    changeReason: 'Legal Update',
    changeDate: '13/11/2025',
    status: 'scheduled',
    originalTemplateId: '6a6867d3-f314-439b-8fc3-8f607c4e6717',
    author: 'Christina Meyer',
    folder: 'Application and Hiring',
  },
  {
    templateName: 'Weiterbildungsvereinbarung mit Rückzahlungsklausel',
    haufeIndex: 'HI223072',
    changeType: 'Publish',
    changeReason: 'Other',
    changeDate: '12/11/2025',
    status: 'scheduled',
    originalTemplateId: '9d2f6b41-8a3c-4e2a-b1f7-5c6e9a0d2b18',
    author: 'Bea Fernandez',
    folder: 'Additional Employment Agreements',
  },
  {
    templateName: 'Fahrtkostenzuschuss, Vereinbarung',
    haufeIndex: 'HI887609',
    changeType: 'Publish',
    changeReason: 'Other',
    changeDate: '09/10/2025',
    status: 'published',
    originalTemplateId: '22a998c8-4b12-421a-9ac9-482c9934e0b1',
    author: 'Christina Meyer',
    folder: 'Additional Employment Agreements',
  },
  {
    templateName: 'Abmahnung, Verstoß gegen Betriebsordnung',
    haufeIndex: 'HI430099',
    changeType: 'Publish',
    changeReason: 'Legal Update',
    changeDate: '04/10/2025',
    status: 'published',
    originalTemplateId: '7e1c4a9d-2f5b-4d8e-9a3c-6b1e8d4f2c07',
    author: 'Bea Fernandez',
    folder: 'Warning Notice',
  },
  {
    templateName: 'Zwischenzeugnis',
    haufeIndex: 'HI230943',
    changeType: 'Update',
    changeReason: 'Legal Update',
    changeDate: '12/09/2025',
    status: 'scheduled',
    originalTemplateId: 'b4d8f2a6-1c9e-4a7b-8d3f-2e6c9a1b5f43',
    author: 'Christina Meyer',
    folder: 'Application and Hiring',
  },
  {
    templateName: 'Datenschutz, Einwilligungserklärung Mitarbeiterfoto',
    haufeIndex: 'HI998032',
    changeType: 'Update',
    changeReason: 'Legal Update',
    changeDate: '01/09/2025',
    status: 'discarded',
    originalTemplateId: 'f3a7c1e9-6d2b-4f8a-9c1e-3b7d5a2f8e64',
    author: 'Christina Meyer',
    folder: 'Employment Contracts',
  },
  {
    templateName: 'Urlaubsantrag, Formular',
    haufeIndex: 'HI871109',
    changeType: 'Import',
    changeReason: 'Other',
    changeDate: '11/08/2025',
    status: 'published',
    originalTemplateId: 'c9e2b6a4-3f8d-4c1a-b7e9-4d2a8f6c1b39',
    author: 'Bea Fernandez',
    folder: 'Special Occasions',
  },
  {
    templateName: 'Krankmeldung, Bescheinigung',
    haufeIndex: 'HI092123',
    changeType: 'Publish',
    changeReason: 'Other',
    changeDate: '31/07/2025',
    status: 'published',
    originalTemplateId: 'a6d1e4c8-9b3f-4e2a-8c6d-1f9a3e7b2c85',
    author: 'Christina Meyer',
    folder: 'Employment Contracts',
  },
  {
    templateName: 'Homeoffice-Vereinbarung, Widerrufsvorbehalt',
    haufeIndex: 'HI220011',
    changeType: 'Update',
    changeReason: 'Other',
    changeDate: '22/07/2025',
    status: 'published',
    originalTemplateId: 'e8b3d6f1-4a9c-4d7e-b2f8-6c1a9d4e3b72',
    author: 'Bea Fernandez',
    folder: 'Additional Employment Agreements',
  },
  {
    templateName: 'Abmahnung wegen Pflichtverletzung',
    haufeIndex: 'HI986534',
    changeType: 'Publish',
    changeReason: 'Legal Update',
    changeDate: '07/07/2025',
    status: 'published',
    originalTemplateId: 'd4f9a2c7-8e1b-4c6d-9a3f-7b2e8d1c4f56',
    author: 'Christina Meyer',
    folder: 'Warning Notice',
  },
  {
    templateName: 'Kündigungsschreiben, ordentliche Kündigung durch Arbeitgeber',
    haufeIndex: 'HI200145',
    changeType: 'Publish',
    changeReason: 'Legal Update',
    changeDate: '05/06/2025',
    status: 'published',
    originalTemplateId: '1c8e4b7a-3d6f-4a9c-8b2e-5d7a1c9f4e38',
    author: 'Bea Fernandez',
    folder: 'Warning Notice',
  },
  {
    templateName: 'Zeugnis, qualifiziertes Arbeitszeugnis',
    haufeIndex: 'HI201087',
    changeType: 'Import',
    changeReason: 'Other',
    changeDate: '18/05/2025',
    status: 'published',
    originalTemplateId: '6f2a9d4e-7c1b-4f8a-9d3e-2b6c8a1f4d95',
    author: 'Christina Meyer',
    folder: 'Application and Hiring',
  },
  {
    templateName: 'Aufhebungsvertrag',
    haufeIndex: 'HI201933',
    changeType: 'Update',
    changeReason: 'Other',
    changeDate: '06/05/2025',
    status: 'discarded',
    originalTemplateId: '3e9c6a1d-8b4f-4e2a-9c7d-1f3a8e6c2b47',
    author: 'Christina Meyer',
    folder: 'Employment Contracts',
  },
  {
    templateName: 'Elternzeit, Antrag auf Elternzeit',
    haufeIndex: 'HI202410',
    changeType: 'Publish',
    changeReason: 'Legal Update',
    changeDate: '24/04/2025',
    status: 'published',
    originalTemplateId: '8a4d2f6c-1e9b-4a3f-8d6c-4b1e9a2f6d73',
    author: 'Bea Fernandez',
    folder: 'Special Occasions',
  },
  {
    templateName: 'Mutterschutz, Mitteilung über Schwangerschaft',
    haufeIndex: 'HI202588',
    changeType: 'Publish',
    changeReason: 'Legal Update',
    changeDate: '16/04/2025',
    status: 'published',
    originalTemplateId: '5b7e1c9a-4f8d-4c2a-9e6b-3d8f1a4c7e29',
    author: 'Christina Meyer',
    folder: 'Special Occasions',
  },
  {
    templateName: 'Abfindungsvereinbarung',
    haufeIndex: 'HI203041',
    changeType: 'Update',
    changeReason: 'Legal Update',
    changeDate: '02/04/2025',
    status: 'scheduled',
    originalTemplateId: '9c3f6b8e-2d4a-4f7c-8b1e-6a9d3f2c8e54',
    author: 'Bea Fernandez',
    folder: 'Employment Contracts',
  },
  {
    templateName: 'Datenschutzerklärung für Bewerber',
    haufeIndex: 'HI203377',
    changeType: 'Import',
    changeReason: 'Other',
    changeDate: '20/03/2025',
    status: 'published',
    originalTemplateId: '2f8d4a6c-9e1b-4d7a-8c3f-5b9e2d6a1f47',
    author: 'Christina Meyer',
    folder: 'Application and Hiring',
  },
  {
    templateName: 'Nebenabrede zum Arbeitsvertrag',
    haufeIndex: 'HI203802',
    changeType: 'Publish',
    changeReason: 'Other',
    changeDate: '08/03/2025',
    status: 'discarded',
    originalTemplateId: '4d9a7c2e-6f1b-4a8d-9c2e-7b4f1a8d6c93',
    author: 'Bea Fernandez',
    folder: 'Additional Employment Agreements',
  },
  {
    templateName: 'Versetzungsschreiben',
    haufeIndex: 'HI204119',
    changeType: 'Publish',
    changeReason: 'Other',
    changeDate: '27/02/2025',
    status: 'published',
    originalTemplateId: '7a1e9c4f-3b6d-4e8a-9f2c-1d6a9e4c7b58',
    author: 'Christina Meyer',
    folder: 'Works Constitution Law',
  },
  {
    templateName: 'Probezeitverlängerung, Vereinbarung',
    haufeIndex: 'HI204456',
    changeType: 'Update',
    changeReason: 'Other',
    changeDate: '13/02/2025',
    status: 'published',
    originalTemplateId: '6c2b8f4a-9d1e-4c7b-8a3f-2e9c6b4a8d15',
    author: 'Bea Fernandez',
    folder: 'Employment Contracts',
  },
  {
    templateName: 'Betriebsvereinbarung, Mustervorlage',
    haufeIndex: 'HI204890',
    changeType: 'Publish',
    changeReason: 'Other',
    changeDate: '01/02/2025',
    status: 'published',
    originalTemplateId: '8f4c1a9e-6b3d-4f2a-9e8c-4a1f9c6e3b72',
    author: 'Christina Meyer',
    folder: 'Works Constitution Law',
  },
  {
    templateName: 'Gleitzeitvereinbarung',
    haufeIndex: 'HI205223',
    changeType: 'Update',
    changeReason: 'Other',
    changeDate: '21/01/2025',
    status: 'published',
    originalTemplateId: '3a9d6f2c-8e4b-4a1d-9c6f-2b8e4a9d1c56',
    author: 'Bea Fernandez',
    folder: 'Additional Employment Agreements',
  },
  {
    templateName: 'Sabbatical, Vereinbarung über unbezahlten Sonderurlaub',
    haufeIndex: 'HI205601',
    changeType: 'Publish',
    changeReason: 'Legal Update',
    changeDate: '09/01/2025',
    status: 'scheduled',
    originalTemplateId: '1e6c9a4f-7d2b-4e8a-9f4c-6a1e9d4c7b83',
    author: 'Christina Meyer',
    folder: 'Special Occasions',
  },
  {
    templateName: 'Dienstwagenüberlassungsvertrag',
    haufeIndex: 'HI205944',
    changeType: 'Import',
    changeReason: 'Other',
    changeDate: '02/01/2025',
    status: 'published',
    originalTemplateId: '9d4a2f6c-1b8e-4d3a-9c7f-2e6a4d9f1c58',
    author: 'Bea Fernandez',
    folder: 'Additional Employment Agreements',
  },
]

export const CHANGE_LOG_ENTRIES: ChangeLogEntry[] = SEED_ROWS.map((row, index) => {
  const updatedTemplateId = row.haufeIndex
  const base: ChangeLogEntry = {
    id: `change-log-${index + 1}`,
    templateName: row.templateName,
    haufeIndex: row.haufeIndex,
    changeType: row.changeType,
    changeReason: row.changeReason,
    changeDate: row.changeDate,
    status: row.status,
    originalTemplateId: row.originalTemplateId,
    updatedTemplateId,
    author: row.author,
    folder: row.folder,
  }

  if (row.changeReason === 'Legal Update') {
    return {
      ...base,
      source: 'Content hub',
      legalUpdate: LEGAL_UPDATE_TEXT,
      changeNotification: CHANGE_NOTIFICATION_TEXT,
    }
  }

  return base
})

export const STATUS_LABELS: Record<ChangeStatus, string> = {
  scheduled: 'Scheduled',
  published: 'Published',
  discarded: 'Discarded',
}

export const STATUS_CHIP_STYLES: Record<ChangeStatus, ChipStyleValue> = {
  scheduled: chipStyles.SEMANTIC_WARNING,
  published: chipStyles.SEMANTIC_SUCCESS,
  discarded: chipStyles.SEMANTIC_DANGER,
}

/** Semantic palette family behind each status, shared by the chip and the panel's status pill. */
export type StatusTone = 'warning' | 'success' | 'danger'

export const STATUS_TONES: Record<ChangeStatus, StatusTone> = {
  scheduled: 'warning',
  published: 'success',
  discarded: 'danger',
}
