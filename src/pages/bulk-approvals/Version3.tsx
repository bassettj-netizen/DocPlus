import { Navigate, Route, Routes } from 'react-router-dom'
import DocumentEditor from './version3/DocumentEditor'

// Everything for this version lives under /bulk-approvals/version-3 — this
// component owns its own nested routing so every screen (starting with
// "home", the document editor + request-approval flow) stays under that
// prefix instead of becoming a top-level route in App.tsx.
export default function BulkApprovalsV3() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" replace />} />
      <Route path="home" element={<DocumentEditor />} />
    </Routes>
  )
}
