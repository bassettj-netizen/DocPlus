import { Icon, iconType, Sidebar } from '@goat-ui/goat-ui-core'
import type { SidebarItem } from '@goat-ui/goat-ui-core'

export default function DocumentEditorSidebar() {
  const topItems = [
    { key: 'edit', icon: <Icon type={iconType.EditOutlined} />, onClick: () => {} },
    { key: 'notes', icon: <Icon type={iconType.NoteSendOutlined} />, onClick: () => {} },
    { key: 'history', icon: <Icon type={iconType.HistoryOutlined} />, onClick: () => {} },
  ] as unknown as SidebarItem[]

  const bottomItems = [
    { key: 'explore', icon: <Icon type={iconType.CompassOutlined} />, onClick: () => {} },
  ] as unknown as SidebarItem[]

  return (
    <Sidebar
      mode="light"
      collapsed
      collapsible={false}
      topItems={topItems}
      bottomItems={bottomItems}
      activeKeys={['edit']}
    />
  )
}
