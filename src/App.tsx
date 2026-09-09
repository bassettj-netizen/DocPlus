import { useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  avatarSizeEnum,
  HaufeLogo,
  haufeLogoVariants,
  Icon,
  iconType,
  Layout,
  ThemeProvider,
  themeVariant,
} from '@goat-ui/goat-ui-core'
import type { SidebarItem, ThemeVariantValue } from '@goat-ui/goat-ui-core'
import HomePage from './pages/HomePage'
import BulkApprovalsV1 from './pages/bulk-approvals/Version1'
import BulkApprovalsV2 from './pages/bulk-approvals/Version2'
import BulkApprovalsV3 from './pages/bulk-approvals/Version3'
import BulkApprovalsV4 from './pages/bulk-approvals/Version4'
import BulkApprovalsV5 from './pages/bulk-approvals/Version5'
import BulkApprovalsV6 from './pages/bulk-approvals/Version6'
import Approvals1 from './pages/bulk-approvals/Approvals1'
import Approvals2 from './pages/bulk-approvals/Approvals2'
import Approvals3 from './pages/bulk-approvals/Approvals3'
import Approvals4 from './pages/bulk-approvals/Approvals4'
import Approvals5 from './pages/bulk-approvals/Approvals5'

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeKey = location.pathname === '/' ? 'home' : ''

  const sidebarTopItems = [
    {
      key: 'home',
      label: 'Home',
      icon: <Icon type={iconType.HouseFilled} />,
      onClick: () => navigate('/'),
    },
    {
      key: 'bulk-approvals',
      label: 'Bulk Approvals',
      icon: <Icon type={iconType.CheckDoubleFilled} />,
      onClick: () => navigate('/bulk-approvals/version-1'),
    },
  ] as unknown as SidebarItem[]

  return (
    <Layout
      header={{
        avatar: {
          srcPlaceholder: 'AM',
          size: avatarSizeEnum.SMALL,
          title: 'Alex Mustermensch',
        },
      }}
      sidebar={{
        topItems: sidebarTopItems,
        collapsible: true,
        activeKeys: [activeKey],
        mode: 'light',
        logoProps: {
          src: (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <HaufeLogo variant={haufeLogoVariants.ICON} />
            </div>
          ),
        },
      }}
    >
      <Outlet />
    </Layout>
  )
}

function App() {
  const [selectedTheme] = useState<ThemeVariantValue>(themeVariant.BLUE)

  return (
    <ThemeProvider selectedTheme={selectedTheme}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Each Bulk Approvals version is a self-contained screen with its own
            header and sidebar per the Figma design — they own their full
            chrome here rather than nesting inside AppShell's Layout. */}
        <Route path="/bulk-approvals/version-1/*" element={<BulkApprovalsV1 />} />
        <Route path="/bulk-approvals/version-2/*" element={<BulkApprovalsV2 />} />
        <Route path="/bulk-approvals/version-3/*" element={<BulkApprovalsV3 />} />
        <Route path="/bulk-approvals/version-4/*" element={<BulkApprovalsV4 />} />
        <Route path="/bulk-approvals/version-5/*" element={<BulkApprovalsV5 />} />
        <Route path="/bulk-approvals/version-6/*" element={<BulkApprovalsV6 />} />
        <Route path="/bulk-approvals/approvals-1/*" element={<Approvals1 />} />
        <Route path="/bulk-approvals/approvals-2/*" element={<Approvals2 />} />
        <Route path="/bulk-approvals/approvals-3/*" element={<Approvals3 />} />
        <Route path="/bulk-approvals/approvals-4/*" element={<Approvals4 />} />
        <Route path="/bulk-approvals/approvals-5/*" element={<Approvals5 />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
