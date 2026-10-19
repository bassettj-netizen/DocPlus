import { useState } from 'react'
import { Anchor, ButtonGhost, ButtonPrimary, Chip, chipStyles, constants, iconType, Tabs, Typography } from '@goat-ui/goat-ui-core'
import { TEMPLATE_SECTIONS } from './data'
import PrototypeLayout from './PrototypeLayout'
import TemplatePreview from './TemplatePreview'

const { colorPalette } = constants

// A template's detail screen, with the header's bell opening the in-app
// notifications popover (see PrototypeLayout).
export default function TemplateDetailsPage() {
  const [activeTab, setActiveTab] = useState('structure')

  return (
    <PrototypeLayout activeNavKey="templates">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          backgroundColor: colorPalette.neutral.lighten5,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 16px 0' }}>
          <div>
            <ButtonGhost leftIcon={iconType.ChevronLeftOutlined}>Back to Templates</ButtonGhost>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <Typography as="h1" size="heading-md" weight="semibold" color="neutral-darken3">
                Arbeitsvertrag für geringfügig Beschäftigte - [HI435662]
              </Typography>
              <Chip label="Haufe" chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.ShieldFilled} uppercase />
              <ButtonGhost leftIcon={iconType.ThreeDotsHorFilled} ariaLabel="More actions" />
            </div>
            <ButtonPrimary>Save as</ButtonPrimary>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            options={[
              { key: 'structure', label: 'Template structure', content: null },
              { key: 'logic', label: 'Logic', content: null },
              { key: 'legal-updates', label: 'Legal updates', content: null },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, padding: 16, flex: 1, minHeight: 0 }}>
          <div
            style={{
              width: 520,
              flexShrink: 0,
              padding: 16,
              borderRadius: 16,
              overflowY: 'auto',
              backgroundColor: colorPalette.white,
            }}
          >
            <Anchor title="Content" items={TEMPLATE_SECTIONS} collapsible={false} />
          </div>

          <TemplatePreview />
        </div>
      </div>
    </PrototypeLayout>
  )
}
