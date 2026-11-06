import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { avatarSizeEnum, Icon, iconType, Layout, Sidebar } from '@goat-ui/goat-ui-core'
import type { SidebarItem } from '@goat-ui/goat-ui-core'
import haufeWordmark from '../../../assets/haufe-wordmark.svg'
import hrdLogo from '../../../assets/hrd-product-logo.svg'
import { UpgradeDot, UpgradeModal } from './Upgrade'
import { useArchivingVersion } from './version'

// The HR Dokumente chrome around the Documents list and the create flow:
// navy side menu, HAUFE header. Only Documents goes anywhere in this
// prototype; the other items are decorative.
export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { basePath, massCreation, archiving } = useArchivingVersion()
  const [collapsed, setCollapsed] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
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
          // Version 14: Mass creation is an upgrade feature too — the dot, and the upgrade dialog instead of the list.
          archiving === 'upgrade'
            ? { key: 'mass-creation', label: <UpgradeDot>Mass creation</UpgradeDot>, icon: <Icon type={iconType.LayersVerFilled} />, onClick: () => setUpgradeOpen(true) }
            : { key: 'mass-creation', label: 'Mass creation', icon: <Icon type={iconType.LayersVerFilled} />, onClick: () => navigate(`${basePath}/bulk`) },
        ],
      }
    : { key: 'documents', label: 'Documents', icon: <Icon type={iconType.ArticleFilled} />, onClick: () => navigate(`${basePath}/documents`) }

  const topItems = [
    { key: 'home', label: 'Home', icon: <Icon type={iconType.HouseFilled} />, onClick: () => {} },
    documentsItem,
    { key: 'admin', label: 'Admin', icon: <Icon type={iconType.LockFilled} />, onClick: () => {} },
  ] as unknown as SidebarItem[]

  const bottomItems = [
    // Version 14: Upgrade above Settings, as in the live product, opening the upgrade dialog.
    ...(archiving === 'upgrade' ? [{ key: 'upgrade', label: 'Upgrade', icon: <Icon type={iconType.CrownOutlined} />, onClick: () => setUpgradeOpen(true) }] : []),
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
      {archiving === 'upgrade' && <UpgradeModal visible={upgradeOpen} onClose={() => setUpgradeOpen(false)} />}
    </Layout>
  )
}
