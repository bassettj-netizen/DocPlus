import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ButtonGhost, constants, Dropdown, Icon, iconType, Radio, SearchBar, Typography } from '@goat-ui/goat-ui-core'
import type { ColorValue } from '@goat-ui/goat-ui-core'
import AppLayout from './AppLayout'
import CreateFlowFooter from './CreateFlowFooter'
import { SOURCE_LABELS, TEMPLATES, type TemplateSource } from './data'
import { useArchivingStore } from './store'
import { useArchivingVersion } from './version'

const { colorPalette } = constants

// Matches the Figma template cards: Haufe templates get a blue icon, the
// company's own a cyan one.
const SOURCE_ICON_COLOR: Record<TemplateSource, ColorValue> = { haufe: 'primary-base', 'my-company': 'cyan-base' }

type Folder = 'overview' | TemplateSource

const FOLDERS: { key: Folder; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'my-company', label: 'My company' },
  { key: 'haufe', label: 'Haufe' },
]

// Step 2 of creating a document, as on the Figma "Select a template" screen.
// Continue creates the draft and opens it in the editor.
export default function SelectTemplatePage() {
  const navigate = useNavigate()
  const store = useArchivingStore()
  const { basePath } = useArchivingVersion()
  const [searchParams] = useSearchParams()
  const employeeId = searchParams.get('employee')
  const [folder, setFolder] = useState<Folder>('overview')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string>()
  const [sort, setSort] = useState<'az' | 'za'>('az')

  const templates = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matching = TEMPLATES.filter((t) => (folder === 'overview' || t.source === folder) && (!query || t.name.toLowerCase().includes(query)))
    // A-Z keeps the order the Figma screen lists them in; Z-A reverses it.
    return sort === 'az' ? matching : [...matching].reverse()
  }, [folder, search, sort])

  const handleContinue = () => {
    if (!employeeId || !selectedId) return
    navigate(`${basePath}/documents/${store.createDocument(employeeId, selectedId)}`)
  }

  return (
    <AppLayout>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16, padding: 16, backgroundColor: colorPalette.neutral.lighten5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <ButtonGhost leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(`${basePath}/documents`)}>
            Back to documents
          </ButtonGhost>
          <Typography as="h1" size="heading-lg" weight="bold" color="neutral-darken5">
            Select a template
          </Typography>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 8 }}>
            <div style={{ width: 400, flexShrink: 0, padding: 16, borderRadius: 16, backgroundColor: colorPalette.white, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Typography size="base-sm" weight="semibold" color="neutral-darken2">
                FOLDERS
              </Typography>
              {FOLDERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFolder(f.key)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: folder === f.key ? colorPalette.neutral.lighten4 : 'transparent',
                  }}
                >
                  {f.key === 'overview' ? (
                    <Icon type={iconType.ArticleOutlined} size={16} />
                  ) : (
                    <>
                      <Icon type={iconType.ChevronRightOutlined} size={12} />
                      <Icon type={iconType.FolderFilled} size={16} />
                    </>
                  )}
                  <Typography as="span">{f.label}</Typography>
                </button>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 0, padding: 16, borderRadius: 16, backgroundColor: colorPalette.white, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Typography as="span" size="heading-md" weight="semibold">
                    {FOLDERS.find((f) => f.key === folder)?.label}
                  </Typography>
                </div>
                <div style={{ width: 300 }}>
                  <SearchBar placeholder="Search for template" value={search} onChange={setSearch} width="expanded" />
                </div>
              </div>

              <div>
                <Dropdown
                  items={[
                    { key: 'az', label: 'Alphabethical (A-Z)', onClick: () => setSort('az') },
                    { key: 'za', label: 'Alphabethical (Z-A)', onClick: () => setSort('za') },
                  ]}
                >
                  <ButtonGhost leftIcon={iconType.ArrowSwapOutlined} rightIcon={iconType.ChevronDownOutlined}>
                    {sort === 'az' ? 'Alphabethical (A-Z)' : 'Alphabethical (Z-A)'}
                  </ButtonGhost>
                </Dropdown>
              </div>

              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {templates.map((template) => {
                  const selected = template.id === selectedId
                  return (
                    <label
                      key={template.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        padding: '10px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `1px solid ${selected ? colorPalette.blue.base : colorPalette.neutral.lighten2}`,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Radio name="template" checked={selected} onChange={() => setSelectedId(template.id)} />
                        <Icon type={iconType.LayersHorFilled} size={16} color={SOURCE_ICON_COLOR[template.source]} />
                        <Typography as="span">{template.name}</Typography>
                      </span>
                      <span style={{ paddingLeft: 48 }}>
                        <Typography as="span" size="base-sm" color="neutral-darken2">
                          {[SOURCE_LABELS[template.source], template.folder, template.author, template.updated, template.hiId && `[${template.hiId}]`]
                            .filter(Boolean)
                            .join('  •  ')}
                        </Typography>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* The template list is taller than the screen, so the toolbar sticks
              to the bottom of the window instead of waiting at the end of the
              list. The page-coloured backing covers the cards scrolling
              beneath it, and the negative margin takes the place of the
              page's bottom padding. */}
          <div style={{ position: 'sticky', bottom: 0, marginBottom: -16, paddingBottom: 16, backgroundColor: colorPalette.neutral.lighten5 }}>
            <CreateFlowFooter
              step={1}
              onBack={() => navigate(`${basePath}/new/employee?employee=${employeeId ?? ''}`)}
              continueDisabled={!selectedId || !employeeId}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
