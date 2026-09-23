// Mock data for the Back Office → Legal Changes screen, transcribed from the
// "Legal Changes Overview" section of the Templates management Figma file.
//
// This page only tracks the pending review queue — once a change is updated
// or discarded here, it moves to the Change Log (see
// ../change-log/store.ts), which is the single history of record across
// Back Office.

export type TemplateSource = 'Content Hub' | 'Manually created'

export interface LegalChange {
  id: string
  templateName: string
  haufeIndex: string
  inboundDate: string
  source: TemplateSource

  /** The legal text delivered by Content Hub — shown in both panels. */
  legalUpdate: string
  /** "Date (Content hub)" in the pending panel — when the change takes effect. */
  contentHubDate: string
  author: string
  folder: string
  originalTemplateId: string
}

/** Folder options from the "select folder" screen of the update flow. */
export const FOLDER_OPTIONS = [
  'Employment Contracts',
  'Additional Employment Agreements',
  'Warning Notice',
  'Special Occasions',
  'Works Constitution Law',
  'Application and Hiring',
]

// The designs show the same legal text on every panel, so it lives here once
// rather than being repeated on each record.
const LEGAL_UPDATE_TEXT =
  'Salary range must be visible in the job posting (§X EntgTranspG amendment). Pay ranges will be ' +
  'mandatorily documented for all positions starting June 1, 2026, and disclosed on request to ' +
  'applicants and employees (Art. 5, 2023/970/EU). Gender-based pay differences greater than 5% ' +
  'within a pay grade must be justified and documented under § 12 EntgTranspG. Employers with 100+ ' +
  "employees must report the gender pay gap yearly, and disclose individual pay data within 30 days " +
  "of each employee's request."

// Exported so LegalChangesPage can reuse it verbatim when it writes a
// reviewed change's summary into the Change Log.
export const CHANGE_NOTIFICATION_TEXT =
  'Salary range must be visible in the job posting (§X EntgTranspG amendment). Pay ranges will be ' +
  'mandatorily documented for all positions starting June 1, 2026'

// The Figma mock reuses one template ID across every row of the panel, so the
// same placeholder GUID is used here.
const ORIGINAL_TEMPLATE_ID = '6a6867d3-f314-439b-8fc3-8f607c4e6717'

interface SeedRow {
  templateName: string
  haufeIndex: string
  inboundDate: string
  source: TemplateSource
  folder: string
  author: string
}

const SEED_ROWS: SeedRow[] = [
  {
    templateName: 'Abrufarbeit, Rahmenvereinbarung',
    haufeIndex: 'HI515079',
    inboundDate: '26/12/2024',
    source: 'Content Hub',
    folder: 'Employment Contracts',
    author: 'Christina Meyer',
  },
  {
    templateName: 'Arbeitsvertrag, befristet mit Sachgrund',
    haufeIndex: 'HI435658',
    inboundDate: '26/12/2024',
    source: 'Manually created',
    folder: 'Employment Contracts',
    author: 'Christina Meyer',
  },
  {
    templateName: 'Arbeitsvertrag, befristet mit Sachgrund',
    haufeIndex: 'HI435658',
    inboundDate: '13/11/2025',
    source: 'Content Hub',
    folder: 'Employment Contracts',
    author: 'Bea Fernandez',
  },
  {
    templateName: 'Arbeitsvertrag, geringfügige Beschäftigung',
    haufeIndex: 'HI435662',
    inboundDate: '04/11/2025',
    source: 'Content Hub',
    folder: 'Additional Employment Agreements',
    author: 'Christina Meyer',
  },
  {
    templateName: 'Freistellungserklärung nach Kündigung',
    haufeIndex: 'HI15963976',
    inboundDate: '23/04/2024',
    source: 'Content Hub',
    folder: 'Warning Notice',
    author: 'Bea Fernandez',
  },
  {
    templateName: 'Homeoffice, Zusatzvereinbarung',
    haufeIndex: 'HI13903614',
    inboundDate: '30/12/2025',
    source: 'Content Hub',
    folder: 'Additional Employment Agreements',
    author: 'Christina Meyer',
  },
  {
    templateName: 'Nebentätigkeitsgenehmigung',
    haufeIndex: 'HI14788027',
    inboundDate: '11/09/2025',
    source: 'Content Hub',
    folder: 'Special Occasions',
    author: 'Christina Meyer',
  },
  {
    templateName: 'Urlaub, Hinweis auf Verfall',
    haufeIndex: 'HI12450319',
    inboundDate: '31/10/2025',
    source: 'Manually created',
    folder: 'Special Occasions',
    author: 'Bea Fernandez',
  },
  {
    templateName: 'Urlaubsbescheinigung bei Austritt aus dem Unternehmen',
    haufeIndex: 'HI837369',
    inboundDate: '08/05/2026',
    source: 'Manually created',
    folder: 'Works Constitution Law',
    author: 'Christina Meyer',
  },
  {
    templateName: 'Urlaub, Vereinbarung von unbezahltem Urlaub',
    haufeIndex: 'HI8791413',
    inboundDate: '18/08/2024',
    source: 'Manually created',
    folder: 'Application and Hiring',
    author: 'Bea Fernandez',
  },
]

function toLegalChange(row: SeedRow, id: string): LegalChange {
  return {
    id,
    templateName: row.templateName,
    haufeIndex: row.haufeIndex,
    inboundDate: row.inboundDate,
    source: row.source,
    legalUpdate: LEGAL_UPDATE_TEXT,
    contentHubDate: '01/06/2026',
    author: row.author,
    folder: row.folder,
    originalTemplateId: ORIGINAL_TEMPLATE_ID,
  }
}

export const PENDING_CHANGES: LegalChange[] = SEED_ROWS.map((row, index) =>
  toLegalChange(row, `pending-${index + 1}`),
)
