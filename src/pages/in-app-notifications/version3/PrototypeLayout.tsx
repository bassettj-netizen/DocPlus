import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { avatarSizeEnum, Layout } from '@goat-ui/goat-ui-core'
import haufeWordmark from '../../../assets/haufe-wordmark.svg'
import NotificationsPopover from './NotificationsPopover'
import TemplateSidebar from './TemplateSidebar'
import { markNotificationsRead, setNotificationRead, useAppNotifications } from './store'

interface PrototypeLayoutProps {
  /** The sidebar item to highlight, if any. */
  activeNavKey?: string
  children: ReactNode
}

// The header and sidebar every screen in this version shares — including
// the bell, so notifications can be checked from anywhere.
export default function PrototypeLayout({ activeNavKey, children }: PrototypeLayoutProps) {
  const navigate = useNavigate()
  const notifications = useAppNotifications()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  return (
    <Layout
      header={{
        // Same sizing workaround as the Back Office screens — the DS's
        // <HaufeLogo> has no preset at the 10px height the design uses.
        leftItems: [
          <div key="haufe-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <img src={haufeWordmark} alt="Haufe" style={{ height: 10, width: 'auto', display: 'block' }} />
          </div>,
        ],
        rightItems: [
          <NotificationsPopover
            key="notifications"
            notifications={notifications}
            onMarkRead={(id) => setNotificationRead(id, true)}
            onMarkSelectedRead={markNotificationsRead}
            onViewAll={() => navigate('/in-app-notifications/version-3/notifications')}
            onOpenSettings={() => navigate('/in-app-notifications/version-3/settings')}
          />,
        ],
        avatar: { srcPlaceholder: 'LC', size: avatarSizeEnum.MEDIUM },
      }}
      customSidebar={<TemplateSidebar activeKey={activeNavKey} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />}
    >
      {children}
    </Layout>
  )
}
