import { useNavigate } from 'react-router-dom'
import { Icon, iconType, Sidebar } from '@goat-ui/goat-ui-core'
import type { SidebarItem } from '@goat-ui/goat-ui-core'
import hrdLogo from '../../../assets/hrd-product-logo.svg'

interface TemplateSidebarProps {
  /** The highlighted item, if the current page is one of them. */
  activeKey?: string
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

// Templates leads back to the template screen and Settings to the
// notification settings; the other destinations don't exist in this
// prototype, so those items are decorative.
export default function TemplateSidebar({ activeKey, collapsed, onCollapsedChange }: TemplateSidebarProps) {
  const navigate = useNavigate()

  const topItems = [
    { key: 'home', label: 'Home', icon: <Icon type={iconType.HouseFilled} />, onClick: () => {} },
    { key: 'documents', label: 'Documents', icon: <Icon type={iconType.ArticleFilled} />, onClick: () => {} },
    {
      key: 'templates',
      label: 'Templates',
      icon: <Icon type={iconType.LockFilled} />,
      onClick: () => navigate('/in-app-notifications/version-4/home'),
    },
  ] as unknown as SidebarItem[]

  const bottomItems = [
    { key: 'explore', label: 'Explore', icon: <Icon type={iconType.CompassOutlined} />, onClick: () => {} },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Icon type={iconType.GearOutlined} />,
      onClick: () => navigate('/in-app-notifications/version-4/settings'),
    },
    { key: 'help', label: 'Help', icon: <Icon type={iconType.HelpCircleOutlined} />, onClick: () => {} },
  ] as unknown as SidebarItem[]

  return (
    <Sidebar
      // Recoloured to the design's navy in index.css — see the rule there.
      id="in-app-notifications-sidebar"
      mode="dark"
      collapsed={collapsed}
      collapsible
      onCollapsedChange={onCollapsedChange}
      topItems={topItems}
      bottomItems={bottomItems}
      activeKeys={activeKey ? [activeKey] : []}
      logoProps={{
        label: 'HR Dokumente',
        src: <img src={hrdLogo} alt="" width={32} height={32} />,
      }}
    />
  )
}
