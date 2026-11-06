import type { ReactNode } from 'react'
import { Badge, ButtonPrimary, ButtonSecondary, constants, Icon, iconType, Modal, Typography } from '@goat-ui/goat-ui-core'
import upgradeIllustration from '../../../assets/upgrade-illustration.png'

const { colorPalette } = constants

// Version 14 ("Archiving as upgrade"): how HR Dokumente marks a feature from a higher plan — a yellow dot beside
// it, and clicking it opens "There's more you can do with HRD!" instead of the feature (as on Mass creation in the
// live product).

/** The yellow dot beside a feature from a higher plan (the live product's #F9A314 is GOAT's yellow-base). */
export function UpgradeDot({ children }: { children: ReactNode }) {
  return (
    // The wrapper lets the label keep its surroundings' colour (index.css) — the badge sets its own dark text otherwise.
    <span className="hrd-upgrade-dot">
      <Badge dot color="yellow-base" offset={[4, 2]}>
        {children}
      </Badge>
    </span>
  )
}

const FEATURES = ['Archiving to your HR system', 'E-signature', 'Bulk document requests']

/** The live product's upgrade dialog. Archiving leads the list, since that's what was clicked. A prototype: its links and buttons go nowhere. */
export function UpgradeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal
      visible={visible}
      title="There’s more you can do with HRD!"
      onClose={onClose}
      withIcon={false}
      minWidth={696}
      maxWidth={696}
      footer={{
        content: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
            <a href="#" onClick={(event) => event.preventDefault()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: colorPalette.blue.base, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Compare all plans
              <Icon type={iconType.ExternalLinkOutlined} size={12} color="blue-base" />
            </a>
            <span style={{ flex: 1 }} />
            <ButtonSecondary leftIcon={iconType.CalendarOutlined} onClick={onClose}>
              Book a meeting
            </ButtonSecondary>
            <ButtonPrimary leftIcon={iconType.RocketOutlined} onClick={onClose}>
              Find your solution
            </ButtonPrimary>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <img src={upgradeIllustration} alt="" style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8 }} />
        <Typography weight="semibold">Did you know there are more features in higher HRD plans? For example:</Typography>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FEATURES.map((feature) => (
            <span key={feature} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
              <Typography as="span">{feature}</Typography>
            </span>
          ))}
          <span style={{ paddingLeft: 24 }}>
            <Typography as="span" size="base-sm" color="neutral-darken2">
              and many more…
            </Typography>
          </span>
        </div>
        <Typography>
          Curious how they’d improve your work? Answer a few questions to find the right plan for you — or book a call and our sales team will walk you through it.
        </Typography>
      </div>
    </Modal>
  )
}
