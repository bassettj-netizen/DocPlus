import { Navigate, Route, Routes } from 'react-router-dom'
import LegalChangesPage from './legal-changes/LegalChangesPage'

// Everything for Back Office → Legal Changes lives under /back-office/legal-changes
// — this component owns its own nested routing so future screens stay under
// that prefix instead of becoming top-level routes in App.tsx.
export default function LegalChanges() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" replace />} />
      <Route path="home" element={<LegalChangesPage />} />
    </Routes>
  )
}
