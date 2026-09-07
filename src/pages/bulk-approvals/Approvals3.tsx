import { Navigate, Route, Routes } from 'react-router-dom'
import ApprovalsList from './approvals3/ApprovalsList'

// Everything for this version lives under /bulk-approvals/approvals-3 — this
// component owns its own nested routing so every screen (starting with
// "list") stays under that prefix instead of becoming a top-level route in
// App.tsx.
export default function Approvals3() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="list" replace />} />
      <Route path="list" element={<ApprovalsList />} />
    </Routes>
  )
}
