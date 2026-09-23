import { Navigate, Route, Routes } from 'react-router-dom'
import UpdatesPage from './updates/UpdatesPage'

// Everything for Back Office → Updates lives under /back-office/updates
// — this component owns its own nested routing so future screens stay under
// that prefix instead of becoming top-level routes in App.tsx.
export default function Updates() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" replace />} />
      <Route path="home" element={<UpdatesPage />} />
    </Routes>
  )
}
