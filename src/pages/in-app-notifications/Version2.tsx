import { Navigate, Route, Routes } from 'react-router-dom'
import NotificationSettings from './shared/NotificationSettings'
import NotificationsPage from './version2/NotificationsPage'
import PrototypeLayout from './version2/PrototypeLayout'
import TemplateDetailsPage from './version2/TemplateDetailsPage'

// Everything for this version lives under /in-app-notifications/version-2 —
// this component owns its own nested routing so future screens stay under
// that prefix instead of becoming top-level routes in App.tsx.
export default function InAppNotificationsV2() {
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
