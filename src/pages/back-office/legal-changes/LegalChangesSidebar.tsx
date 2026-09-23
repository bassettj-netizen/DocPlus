import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '@goat-ui/goat-ui-core'
import type { SidebarItem } from '@goat-ui/goat-ui-core'
import hrdLogo from '../../../assets/hrd-product-logo.svg'
import { ChangeLogIcon, LegalChangesIcon, TemplatesIcon } from '../navIcons'

// The DS only adds icon spacing to its own <Icon> component, so these inline
// SVGs (see navIcons.tsx for why they're inlined rather than <img>-loaded)
// need the gap applied manually here.
function NavIcon({ children }: { children: ReactNode }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10 }}>{children}</span>
}

interface LegalChangesSidebarProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

export default function LegalChangesSidebar({ collapsed, onCollapsedChange }: LegalChangesSidebarProps) {
  const navigate = useNavigate()

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
      key: 'legal-changes',
      label: 'Legal Changes',
      icon: (
        <NavIcon>
          <LegalChangesIcon />
        </NavIcon>
      ),
      onClick: () => {},
    },
    {
      key: 'change-log',
      label: 'Change Log',
      icon: (
        <NavIcon>
          <ChangeLogIcon />
        </NavIcon>
      ),
      onClick: () => navigate('/back-office/change-log/home'),
    },
  ] as unknown as SidebarItem[]

  return (
    <Sidebar
      mode="dark"
      collapsed={collapsed}
      collapsible
      onCollapsedChange={onCollapsedChange}
      topItems={topItems}
      activeKeys={['legal-changes']}
      logoProps={{
        label: 'HR Dokumente',
        src: <img src={hrdLogo} alt="" width={32} height={32} />,
      }}
    />
  )
}
