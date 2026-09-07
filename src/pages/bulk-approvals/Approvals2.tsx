import { Navigate, Route, Routes } from 'react-router-dom'
import ApprovalsList from './approvals2/ApprovalsList'

// Everything for this version lives under /bulk-approvals/approvals-2 — this
// component owns its own nested routing so every screen (starting with
// "list") stays under that prefix instead of becoming a top-level route in
// App.tsx.
export default function Approvals2() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="list" replace />} />
      <Route path="list" element={<ApprovalsList />} />
    </Routes>
  )
}
