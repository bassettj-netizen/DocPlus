import { Navigate, Route, Routes } from 'react-router-dom'
import NotificationSettings from './shared/NotificationSettings'
import NotificationsPage from './version4/NotificationsPage'
import PrototypeLayout from './version4/PrototypeLayout'
import TemplateDetailsPage from './version4/TemplateDetailsPage'

// Everything for this version lives under /in-app-notifications/version-4 —
// this component owns its own nested routing so future screens stay under
// that prefix instead of becoming top-level routes in App.tsx.
export default function InAppNotificationsV4() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" replace />} />
      <Route path="home" element={<TemplateDetailsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route
        path="settings"
        element={
          <PrototypeLayout activeNavKey="settings">
            <NotificationSettings />
          </PrototypeLayout>
        }
      />
    </Routes>
  )
}
