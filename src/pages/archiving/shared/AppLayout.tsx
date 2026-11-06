import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { avatarSizeEnum, Icon, iconType, Layout, Sidebar } from '@goat-ui/goat-ui-core'
import type { SidebarItem } from '@goat-ui/goat-ui-core'
import haufeWordmark from '../../../assets/haufe-wordmark.svg'
import hrdLogo from '../../../assets/hrd-product-logo.svg'
import { useArchivingVersion } from './version'

// The HR Dokumente chrome around the Documents list and the create flow:
// navy side menu, HAUFE header. Only Documents goes anywhere in this
// prototype; the other items are decorative.
export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { basePath, massCreation } = useArchivingVersion()
  const [collapsed, setCollapsed] = useState(false)
  // Versions with Mass creation split Documents into its two lists.
  const inBulk = location.pathname.startsWith(`${basePath}/bulk`)
  const activeKey = massCreation ? (inBulk ? 'mass-creation' : 'individual') : 'documents'

  const documentsItem = massCreation
    ? {
        key: 'documents',
        label: 'Documents',
        icon: <Icon type={iconType.ArticleFilled} />,
        children: [
          // Icons as in the Figma bulk flow's side menu.
          { key: 'individual', label: 'Individual', icon: <Icon type={iconType.NoteSendFilled} />, onClick: () => navigate(`${basePath}/documents`) },
          { key: 'mass-creation', label: 'Mass creation', icon: <Icon type={iconType.LayersVerFilled} />, onClick: () => navigate(`${basePath}/bulk`) },
        ],
      }
    : { key: 'documents', label: 'Documents', icon: <Icon type={iconType.ArticleFilled} />, onClick: () => navigate(`${basePath}/documents`) }

  const topItems = [
    { key: 'home', label: 'Home', icon: <Icon type={iconType.HouseFilled} />, onClick: () => {} },
    documentsItem,
    { key: 'admin', label: 'Admin', icon: <Icon type={iconType.LockFilled} />, onClick: () => {} },
  ] as unknown as SidebarItem[]

  const bottomItems = [
    { key: 'settings', label: 'Settings', icon: <Icon type={iconType.GearOutlined} />, onClick: () => {} },
    { key: 'faq', label: 'FAQ', icon: <Icon type={iconType.HelpCircleOutlined} />, onClick: () => {} },
  ] as unknown as SidebarItem[]

  return (
    <Layout
      header={{
        // Same sizing workaround as the other prototypes — the DS's
        // <HaufeLogo> has no preset at the 10px height the design uses.
        leftItems: [
          <div key="haufe-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <img src={haufeWordmark} alt="Haufe" style={{ height: 10, width: 'auto', display: 'block' }} />
          </div>,
        ],
        avatar: { srcPlaceholder: 'LC', size: avatarSizeEnum.MEDIUM },
      }}
      customSidebar={
        <Sidebar
          // Recoloured to the design's navy in index.css, like In-app notifications.
          id="archiving-sidebar"
          mode="dark"
          collapsed={collapsed}
          collapsible
          onCollapsedChange={setCollapsed}
          topItems={topItems}
          bottomItems={bottomItems}
          activeKeys={[activeKey]}
          defaultOpenKeys={massCreation ? ['documents'] : []}
          logoProps={{
            label: 'HR Dokumente',
            src: <img src={hrdLogo} alt="" width={32} height={32} />,
          }}
        />
      }
    >
      {children}
    </Layout>
  )
}
