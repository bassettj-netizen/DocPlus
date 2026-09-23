import { Navigate, Route, Routes } from 'react-router-dom'
import ChangeLogPage from './change-log/ChangeLogPage'

// Everything for Back Office → Change Log lives under /back-office/change-log
// — this component owns its own nested routing so future screens stay under
// that prefix instead of becoming top-level routes in App.tsx.
export default function ChangeLog() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" replace />} />
      <Route path="home" element={<ChangeLogPage />} />
    </Routes>
  )
}
