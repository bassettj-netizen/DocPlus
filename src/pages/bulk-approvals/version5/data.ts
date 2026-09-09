export interface DocumentRecord {
  id: string
  employeeName: string
  position: string
  organisation: string
}

// Mirrors the Figma mock: each "document" is one employee's copy of the
// contract being sent out for bulk approval.
export const DOCUMENT_POOL: DocumentRecord[] = [
  { id: '1', employeeName: 'April Curtis', position: 'HR', organisation: 'COS' },
  { id: '2', employeeName: 'Dori Doreau', position: 'Client Support', organisation: 'COS' },
  { id: '3', employeeName: 'Emily Biel', position: 'Client Support', organisation: 'COS' },
  { id: '4', employeeName: 'Lynn Tanner', position: 'IT', organisation: 'COS' },
  { id: '5', employeeName: 'Peter Thornton', position: 'Office Manager', organisation: 'COS' },
  { id: '6', employeeName: 'Marco Bianchi', position: 'IT', organisation: 'TAL' },
  { id: '7', employeeName: 'Sofia Lindqvist', position: 'HR', organisation: 'TAL' },
  { id: '8', employeeName: 'Nadia Kowalski', position: 'Client Support', organisation: 'PPS' },
  { id: '9', employeeName: 'Tom Fischer', position: 'Office Manager', organisation: 'PPS' },
  { id: '10', employeeName: 'Elena Petrova', position: 'IT', organisation: 'PPS' },
  { id: '11', employeeName: 'Jonas Weber', position: 'HR', organisation: 'COS' },
  { id: '12', employeeName: 'Priya Nair', position: 'Client Support', organisation: 'TAL' },
]

export const POSITION_OPTIONS = Array.from(new Set(DOCUMENT_POOL.map((doc) => doc.position))).map((position) => ({
  label: position,
  value: position,
}))

export const ORGANISATION_OPTIONS = Array.from(new Set(DOCUMENT_POOL.map((doc) => doc.organisation))).map((organisation) => ({
  label: organisation,
  value: organisation,
}))

export interface Approver {
  id: string
  email: string
  documentIds: string[]
}

export interface DocumentFilters {
  positions: string[]
  organisations: string[]
}

export const EMPTY_FILTERS: DocumentFilters = { positions: [], organisations: [] }
