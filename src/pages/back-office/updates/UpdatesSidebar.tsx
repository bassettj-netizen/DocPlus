import type { ReactNode } from 'react'
import { Icon, iconType, Sidebar } from '@goat-ui/goat-ui-core'
import type { SidebarItem } from '@goat-ui/goat-ui-core'
import hrdLogo from '../../../assets/hrd-product-logo.svg'
import { TemplatesIcon } from '../navIcons'

// The layer-stack glyph is an inlined SVG exported from Figma — see
// navIcons.tsx for why. "Updates" combines the old Legal Changes and Change
// Log pages, so it uses a real DS icon (refresh) instead of a new custom
// one; being a proper <Icon>, it doesn't need the same currentColor
// workaround the inlined SVG does.
function NavIcon({ children }: { children: ReactNode }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10 }}>{children}</span>
}

interface UpdatesSidebarProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

export default function UpdatesSidebar({ collapsed, onCollapsedChange }: UpdatesSidebarProps) {
  const topItems = [
    {
      key: 'templates',
      label: 'Templates',
      icon: (
        <NavIcon>
          <TemplatesIcon />
        </NavIcon>
      ),
      // No Templates page exists in this app — decorative, matches the design.
      onClick: () => {},
    },
    {
      key: 'updates',
      label: 'Updates',
      icon: (
        <NavIcon>
          <Icon type={iconType.RefreshOutlined} />
        </NavIcon>
      ),
      onClick: () => {},
    },
  ] as unknown as SidebarItem[]

  return (
    <Sidebar
      mode="dark"
      collapsed={collapsed}
      collapsible
      onCollapsedChange={onCollapsedChange}
      topItems={topItems}
      activeKeys={['updates']}
      logoProps={{
        label: 'HR Dokumente',
        src: <img src={hrdLogo} alt="" width={32} height={32} />,
      }}
    />
  )
}
