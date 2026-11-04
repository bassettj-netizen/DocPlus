import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ButtonGhost, constants, Icon, iconType, Segmented, Sidebar, Typography } from '@goat-ui/goat-ui-core'
import type { SidebarItem } from '@goat-ui/goat-ui-core'
import DocumentPreview from './DocumentPreview'
import { useArchivingVersion } from './version'

const { colorPalette } = constants

// Sampled from the Figma canvas behind the document pages — not one of the
// design system's named tokens.
const PREVIEW_CANVAS_COLOR = '#F2F4F6'

interface EditorLayoutProps {
  title: string
  /** The buttons on the right of the navy top bar. */
  actions?: ReactNode
  /** The "Document editor" column. */
  form: ReactNode
  /** A toolbar along the bottom of the screen, under the form and preview. */
  footer?: ReactNode
  children?: ReactNode
}

// The document editor from the Figma flows: navy top bar, icon rail, the
// 440px fields column, and the A4 preview.
export default function EditorLayout({ title, actions, form, footer, children }: EditorLayoutProps) {
  const navigate = useNavigate()
  const { basePath } = useArchivingVersion()
  const [view, setView] = useState<string | number>('Editor view')

  // Toasts render outside the app, on <body>; this class lets index.css drop
  // them below the navy top bar while an editor is open.
  useEffect(() => {
    document.body.classList.add('archiving-editor')
    return () => document.body.classList.remove('archiving-editor')
  }, [])

  const topItems = [
    { key: 'edit', icon: <Icon type={iconType.EditOutlined} />, onClick: () => {} },
    { key: 'notes', icon: <Icon type={iconType.NoteSendOutlined} />, onClick: () => {} },
    { key: 'history', icon: <Icon type={iconType.HistoryOutlined} />, onClick: () => {} },
  ] as unknown as SidebarItem[]

  const bottomItems = [{ key: 'explore', icon: <Icon type={iconType.CompassOutlined} />, onClick: () => {} }] as unknown as SidebarItem[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colorPalette.white }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, backgroundColor: '#2f384a', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <ButtonGhost onClick={() => navigate(`${basePath}/documents`)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: colorPalette.neutral.lighten5 }}>
              <Icon type={iconType.ChevronLeftOutlined} color="neutral-lighten5" size={16} />
              Back to documents
            </span>
          </ButtonGhost>
        </div>
        <Typography as="span" weight="bold" color="neutral-lighten5">
          {title}
        </Typography>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>{actions}</div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ flexShrink: 0 }}>
          <Sidebar mode="light" collapsed collapsible={false} topItems={topItems} bottomItems={bottomItems} activeKeys={['edit']} />
        </div>

        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            <div style={{ width: 440, flexShrink: 0, minHeight: 0, overflowY: 'auto', borderRight: `1px solid ${colorPalette.neutral.lighten2}` }}>
              {form}
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', flexShrink: 0, backgroundColor: PREVIEW_CANVAS_COLOR }}>
                <Segmented options={['Editor view', 'PDF preview']} value={view} onChange={setView} />
              </div>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 40, display: 'flex', justifyContent: 'center', backgroundColor: PREVIEW_CANVAS_COLOR }}>
                <DocumentPreview />
              </div>
            </div>
          </div>

          {footer && <div style={{ padding: 8, flexShrink: 0, borderTop: `1px solid ${colorPalette.neutral.lighten2}` }}>{footer}</div>}
        </div>
      </div>

      {children}
    </div>
  )
}
