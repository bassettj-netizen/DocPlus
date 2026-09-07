export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalDocument {
  id: string
  employeeName: string
  position: string
  organisation: string
  status: ApprovalStatus
}

// The documents assigned to this approver for the current bulk approval
// request — mirrors the employees from the sender-side document pool
// (src/pages/bulk-approvals/version4/data.ts) since they're the same batch,
// just viewed from the approver's side.
export const INITIAL_ASSIGNED_DOCUMENTS: ApprovalDocument[] = [
  { id: '1', employeeName: 'April Curtis', position: 'HR', organisation: 'COS', status: 'pending' },
  { id: '2', employeeName: 'Dori Doreau', position: 'Client Support', organisation: 'COS', status: 'pending' },
  { id: '3', employeeName: 'Emily Biel', position: 'Client Support', organisation: 'COS', status: 'pending' },
  { id: '4', employeeName: 'Lynn Tanner', position: 'IT', organisation: 'COS', status: 'pending' },
  { id: '5', employeeName: 'Peter Thornton', position: 'Office Manager', organisation: 'COS', status: 'pending' },
]

export const DOCUMENT_TITLE = 'Fortbildungsvertrag mit Rückzahlungsklausel'
