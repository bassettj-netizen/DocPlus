import type { DocumentFields } from './fields'

export const ARCHIVE_SYSTEM = 'Personio'

/** The whole journey, from picking an employee to filing the document. */
export const FLOW_STEPS = ['Employee', 'Template', 'Fill in', 'Export', 'Archive'] as const

/** How long an archived document stays in HR Dokumente before it's deleted (the copy in the HR system stays). */
export const ARCHIVE_RETENTION_DAYS = 30

/** When an archived document is deleted from HR Dokumente, and how many whole days are left until then. */
export function archiveDeletion(archivedAt: Date, now = new Date()) {
  const deletesAt = new Date(archivedAt.getTime() + ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000)
  const daysLeft = Math.max(0, Math.ceil((deletesAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
  return { deletesAt, daysLeft }
}

/** The document limit behind the "n/5 Documents created" meter. */
export const DOCUMENT_LIMIT = 5

export function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
  organisation: string
}

// The names from the Figma "Select an employee" screen. Its second Peter
// Thornton is swapped for Giulia Schmitt — the employee the document preview
// and the "Finish document" dialog are written for.
export const EMPLOYEES: Employee[] = [
  { id: 'e1', firstName: 'Sledge', lastName: 'Hammer', position: 'Sales', organisation: 'COS' },
  { id: 'e2', firstName: 'Dori', lastName: 'Doreau', position: 'Client Support', organisation: 'COS' },
  { id: 'e3', firstName: 'Angus', lastName: 'MacGyver', position: 'IT', organisation: 'TAL' },
  { id: 'e4', firstName: 'Lynn', lastName: 'Tanner', position: 'IT', organisation: 'COS' },
  { id: 'e5', firstName: 'Peter', lastName: 'Thornton', position: 'Office Manager', organisation: 'COS' },
  { id: 'e6', firstName: 'Dr. Bonnie', lastName: 'Barstow', position: 'Research', organisation: 'PPS' },
  { id: 'e7', firstName: 'Emily', lastName: 'Biel', position: 'HR', organisation: 'PPS' },
  { id: 'e8', firstName: 'April', lastName: 'Curtis', position: 'HR', organisation: 'COS' },
  { id: 'e9', firstName: 'Mike', lastName: 'Torello', position: 'Sales', organisation: 'TAL' },
  { id: 'e10', firstName: 'Giulia', lastName: 'Schmitt', position: 'Client Support', organisation: 'COS' },
]

export function employeeName(employee: Employee) {
  return `${employee.firstName} ${employee.lastName}`
}

export type TemplateSource = 'my-company' | 'haufe'

export interface Template {
  id: string
  name: string
  source: TemplateSource
  /** Shown in the card's meta line; company templates without a folder skip it. */
  folder?: string
  author: string
  updated: string
  /** Haufe's content ID, e.g. [HI435641]. */
  hiId?: string
  /** The personnel-file category the document is archived under. */
  archiveCategory: string
}

// The templates from the Figma "Select a template" screen, in its order
// (alphabetical in the design's sense), plus the Fortbildungsvertrag the
// editor screens use.
export const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Arbeitsvertrag, unbefristet',
    source: 'my-company',
    folder: 'Arbeitsvertrage',
    author: 'Jeremy Tull',
    updated: '14/09/2024',
    archiveCategory: 'Verträge',
  },
  {
    id: 't2',
    name: 'Abrufarbeit, Rahmenvereinbarung',
    source: 'haufe',
    folder: 'Arbeitsvertrage',
    author: 'Haufe authors',
    updated: '23/06/2024',
    hiId: 'HI435641',
    archiveCategory: 'Verträge',
  },
  { id: 't3', name: 'Abrufarbeit Rahmenvereinbarung', source: 'my-company', author: 'Lucy Inkredible', updated: '23/06/2024', archiveCategory: 'Verträge' },
  {
    id: 't4',
    name: 'Arbeitsvertrag mit Werkstudenten, befristet ohne Sachgrund',
    source: 'my-company',
    folder: 'Arbeitsvertrage',
    author: 'Lucy Inkredible',
    updated: '23/06/2024',
    archiveCategory: 'Verträge',
  },
  {
    id: 't5',
    name: 'Arbeitsvertrag, befristet ohne Sachgrund',
    source: 'haufe',
    folder: 'Arbeitsrechtliche Zusatzvereinbarungen',
    author: 'Haufe authors',
    updated: '23/06/2024',
    hiId: 'HI435641',
    archiveCategory: 'Verträge',
  },
  {
    id: 't6',
    name: 'Urlaub, Hinwies auf Verfall',
    source: 'haufe',
    folder: 'Urlaub',
    author: 'Haufe authors',
    updated: '23/06/2024',
    hiId: 'HI435641',
    archiveCategory: 'Urlaub',
  },
  {
    id: 't7',
    name: 'Freistellungserklärung nach Kündigung des Arbeitsverhältnisses',
    source: 'my-company',
    folder: 'Vereinbarungen bei Beendigung',
    author: 'Lucy Inkredible',
    updated: '23/06/2024',
    archiveCategory: 'Beendigung',
  },
  {
    id: 't8',
    name: 'Befristeter Arbeitsvertrag ohne Sachgrund, Verlängerung',
    source: 'my-company',
    folder: 'Arbeitsverträge',
    author: 'Rachel Green',
    updated: '14/09/2024',
    archiveCategory: 'Verträge',
  },
  {
    id: 't9',
    name: 'Mutterschutz, Unterrichtung konkretisierte Gefährdungsbeurteilung',
    source: 'haufe',
    folder: 'Mutterschutz und Elternzeit',
    author: 'Haufe authors',
    updated: '23/06/2024',
    hiId: 'HI447599',
    archiveCategory: 'Mutterschutz',
  },
  {
    id: 't10',
    name: 'Fortbildungsvertrag mit Rückzahlungsklausel',
    source: 'haufe',
    folder: 'Weiterbildung',
    author: 'Haufe authors',
    updated: '23/06/2024',
    hiId: 'HI1129784',
    archiveCategory: 'Weiterbildung',
  },
]

/** The folders in an employee's personnel file in the HR system that a document can be archived to. */
export const ARCHIVE_FOLDERS = [
  'Abmahnungen',
  'Beendigung',
  'Bescheinigungen',
  'Gehalt und Vergütung',
  'Mutterschutz',
  'Sonstiges',
  'Urlaub',
  'Verträge',
  'Weiterbildung',
]

export const SOURCE_LABELS: Record<TemplateSource, string> = { 'my-company': 'My company', haufe: 'Haufe' }

export interface HrdDocument {
  id: string
  name: string
  employeeId: string
  templateId: string
  createdAt: Date
  modifiedAt: Date
  /** The editor's field values, as last saved. */
  fields?: DocumentFields
  /** Set when the user completes it with Done in a Finish dialog. */
  finishedAt?: Date
  /** Set once the document has been archived in the HR system. */
  archivedAt?: Date
  /** The personnel-file folder it was archived to, where the user picked one; otherwise the template's archiveCategory. */
  archiveFolder?: string
  /** Created from a template but not saved yet. */
  unsaved?: boolean
  /** Owned by a colleague who shared it with the user; unset for the user's own documents. */
  sharedBy?: string
  /** Set on a document saved as a new version of an archived one: its number (2, 3, …). The first version has none. */
  version?: number
  /** The id of the first version, shared by every later version of the same document. */
  versionOf?: string
  /** A bulk document (Mass creation): the employees it's created for, one copy each. `employeeId` is the first of them. */
  employeeIds?: string[]
  /** A bulk document's copies archived so far, by employee. `archivedAt` is only set once every copy is archived. */
  archivedFor?: Record<string, { at: Date; folder: string }>
}

/** How many of a bulk document's copies are archived. */
export function archivedCount(doc: HrdDocument) {
  return Object.keys(doc.archivedFor ?? {}).length
}

const DAY = 24 * 60 * 60 * 1000

// The Mass creation list's starting documents: one open, one with some
// copies archived, one fully archived.
export function createBulkSeedDocuments(): HrdDocument[] {
  const seed = (name: string, employeeIds: string[], templateId: string, date: Date, extra: Partial<HrdDocument> = {}): HrdDocument => ({
    id: newDocumentId(),
    name,
    employeeId: employeeIds[0],
    employeeIds,
    templateId,
    createdAt: date,
    modifiedAt: date,
    fields: {
      title: name,
      coverLetter: 'no',
      gender: 'female',
      employer: 'Docplus',
      firstName: '',
      lastName: '',
      requestedBy: 'employer',
      total: '',
      costCoverage: '',
      tuition: '',
      continuedPay: '',
      travel: '',
    },
    ...extra,
  })
  const tenDaysAgo = new Date(Date.now() - 10 * DAY)
  return [
    seed('Urlaub, Hinweis auf Verfall 2026', ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'], 't6', new Date(2026, 9, 20)),
    seed('Arbeitsvertrag, befristet ohne Sachgrund – Q4', ['e2', 'e4', 'e7', 'e9', 'e10'], 't5', new Date(2026, 9, 13), {
      archivedFor: {
        e2: { at: new Date(Date.now() - 2 * DAY), folder: 'Verträge' },
        e4: { at: new Date(Date.now() - 2 * DAY), folder: 'Verträge' },
      },
    }),
    seed('Fortbildungsvertrag mit Rückzahlungsklausel', ['e3', 'e6', 'e8', 'e9'], 't10', new Date(2026, 8, 28), {
      archivedAt: tenDaysAgo,
      archiveFolder: 'Weiterbildung',
      archivedFor: Object.fromEntries(['e3', 'e6', 'e8', 'e9'].map((id) => [id, { at: tenDaysAgo, folder: 'Weiterbildung' }])),
    }),
  ]
}

let nextId = 1
export function newDocumentId() {
  return `doc-${nextId++}`
}

// The four rows on the Figma "Choose a new or existing document" screen.
// With `completed`, each one already has its mandatory fields filled in
// for its employee, as a document someone finished earlier would — except
// the third, which was saved part-way: no last name, and "Auf wessen
// Wunsch" unanswered.
//
// With `shared`, three documents colleagues shared with the user follow —
// one of them already archived.
export function createSeedDocuments({ completed = false, shared = false } = {}): HrdDocument[] {
  const seed = (
    name: string,
    employeeId: string,
    templateId: string,
    date: Date,
    gender: string,
    partial = false,
    extra: Partial<HrdDocument> = {},
  ): HrdDocument => {
    const employee = EMPLOYEES.find((e) => e.id === employeeId)
    return {
      id: newDocumentId(),
      name,
      employeeId,
      templateId,
      createdAt: date,
      modifiedAt: date,
      fields: completed
        ? {
            title: name,
            coverLetter: 'no',
            gender,
            employer: 'Docplus',
            firstName: employee?.firstName ?? '',
            lastName: partial ? '' : (employee?.lastName ?? ''),
            requestedBy: partial ? undefined : 'employer',
            total: '',
            costCoverage: '',
            tuition: '',
            continuedPay: '',
            travel: '',
          }
        : undefined,
      ...extra,
    }
  }
  const sharedDocuments = shared
    ? [
        seed('Befristeter Arbeitsvertrag ohne Sachgrund, Verlängerung', 'e1', 't8', new Date(2024, 5, 24), 'male', false, { sharedBy: 'Rachel Green' }),
        seed('Freistellungserklärung nach Kündigung des Arbeitsverhältnisses', 'e9', 't7', new Date(2024, 5, 14), 'male', true, { sharedBy: 'Jeremy Tull' }),
        seed('Urlaub, Hinweis auf Verfall', 'e3', 't6', new Date(2024, 4, 28), 'male', false, {
          sharedBy: 'Lucy Inkredible',
          // Archived 25 days ago, so it's close to being deleted from HR Dokumente.
          archivedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        }),
      ]
    : []
  return [
    seed('Arbeitsvertrag für geringfügig Beschäftigte - [HI435662] (Kopie 3) 04-04-2024', 'e4', 't1', new Date(2024, 5, 21), 'female'),
    seed('Arbeitsvertrag für geringfügig Beschäftigte', 'e2', 't1', new Date(2024, 5, 19), 'female'),
    seed('Arbeitsvertrag für geringfügig Beschäftigte - [HI435662] (Kopie 3) 04-04-2024', 'e5', 't1', new Date(2024, 5, 11), 'male', true),
    seed('Mutterschutz: Unterrichtung konkretisierte Gefährdungsbeurteilung - [HI11335021]', 'e7', 't9', new Date(2024, 4, 4), 'female'),
    ...sharedDocuments,
  ]
}
