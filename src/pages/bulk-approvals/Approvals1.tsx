import { Navigate, Route, Routes } from 'react-router-dom'
import ApprovalsList from './approvals1/ApprovalsList'

// Everything for this version lives under /bulk-approvals/approvals-1 — this
// component owns its own nested routing so every screen (starting with
// "list", the approver's assigned-documents view with the approve/reject
// flow) stays under that prefix instead of becoming a top-level route in
// App.tsx.
export default function Approvals1() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="list" replace />} />
      <Route path="list" element={<ApprovalsList />} />
    </Routes>
  )
}
