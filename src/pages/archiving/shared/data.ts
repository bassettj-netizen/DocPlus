import type { DocumentFields } from './fields'

export const ARCHIVE_SYSTEM = 'Personio'

/** The whole journey, from picking an employee to filing the document. */
export const FLOW_STEPS = ['Employee', 'Template', 'Fill in', 'Export', 'Archive'] as const

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
  /** Created from a template but not saved yet. */
  unsaved?: boolean
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
export function createSeedDocuments({ completed = false } = {}): HrdDocument[] {
  const seed = (name: string, employeeId: string, templateId: string, date: Date, gender: string, partial = false): HrdDocument => {
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
    }
  }
  return [
    seed('Arbeitsvertrag für geringfügig Beschäftigte - [HI435662] (Kopie 3) 04-04-2024', 'e4', 't1', new Date(2024, 5, 21), 'female'),
    seed('Arbeitsvertrag für geringfügig Beschäftigte', 'e2', 't1', new Date(2024, 5, 19), 'female'),
    seed('Arbeitsvertrag für geringfügig Beschäftigte - [HI435662] (Kopie 3) 04-04-2024', 'e5', 't1', new Date(2024, 5, 11), 'male', true),
    seed('Mutterschutz: Unterrichtung konkretisierte Gefährdungsbeurteilung - [HI11335021]', 'e7', 't9', new Date(2024, 4, 4), 'female'),
  ]
}
