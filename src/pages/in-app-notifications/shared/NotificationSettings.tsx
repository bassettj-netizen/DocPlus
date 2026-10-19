import { constants, Toggle, Typography } from '@goat-ui/goat-ui-core'
import { NOTIFICATION_CATEGORIES, setCategoryEnabled, useNotificationSettings } from './settingsStore'

const { colorPalette } = constants

// The theme's "primary" family is only resolved at runtime by ThemeProvider,
// so it isn't available as a static hex in `colorPalette` — this is the BLUE
// theme's primary.base, used for the selected side tab's border and marker.
const PRIMARY_COLOR = '#3342FF'

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const

const SIDE_TABS = [
  { key: 'preferences', label: 'Preferences' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'organisations', label: 'Organisations' },
]

/** One entry in the Settings side menu (Figma "Side tab"). */
function SideTab({ label, selected }: { label: string; selected: boolean }) {
  return (
    <div
      aria-current={selected ? 'page' : undefined}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: 48,
        padding: '12px 16px',
        borderRadius: 8,
        border: `1px solid ${selected ? PRIMARY_COLOR : 'transparent'}`,
        backgroundColor: selected ? colorPalette.neutral.lighten2 : colorPalette.white,
      }}
    >
      {selected && (
        <span
          style={{ position: 'absolute', left: 6, top: 7, width: 3, height: 32, borderRadius: 2, backgroundColor: PRIMARY_COLOR }}
        />
      )}
      <Typography size="base-lg" weight={selected ? 'semibold' : 'regular'} color={selected ? 'primary-base' : 'black'}>
        {label}
      </Typography>
    </div>
  )
}

// The Settings screen (Figma "Preference", 5908:43605), opened from the gear
// in the notifications popover, with its Notifications section: one card
// per notification category, each with an on/off toggle. Preferences and
// Organisations aren't part of this prototype, so those tabs are decorative.
export default function NotificationSettings() {
  const enabled = useNotificationSettings()

  return (
    <div style={{ height: '100%', minHeight: 0, overflowY: 'auto', backgroundColor: colorPalette.neutral.lighten5 }}>
      <div style={{ padding: '16px 20px' }}>
        <h1 style={{ margin: 0, fontSize: 25, lineHeight: '40px', fontWeight: 600, color: colorPalette.black }}>Settings</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', padding: '16px 0' }}>
        <nav aria-label="Settings" style={{ width: 272, flexShrink: 0, padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, textTransform: 'uppercase', color: colorPalette.neutral.base }}>
              General
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SIDE_TABS.map((tab) => (
                <SideTab key={tab.key} label={tab.label} selected={tab.key === 'notifications'} />
              ))}
            </div>
          </div>
        </nav>

        <section
          aria-label="Notifications"
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '0 16px 16px',
            borderLeft: `1px solid ${colorPalette.neutral.lighten1}`,
            minHeight: 840,
          }}
        >
          <div style={{ padding: '0 16px' }}>
            <Typography size="base-lg" color="black">
              Customise which notifications you receive.
            </Typography>
          </div>

          {NOTIFICATION_CATEGORIES.map((category) => (
            <div
              key={category.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                minHeight: 64,
                padding: 16,
                borderRadius: 16,
                backgroundColor: colorPalette.white,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title case, as in the design. Figma's neutral.darken3 is near-black
                      (#181B21); the installed palette's darken3 is a slate blue, so
                      darken5 is the closest match. */}
                  <span style={{ fontSize: 14, lineHeight: '18px', fontWeight: 700, textTransform: 'capitalize', color: colorPalette.neutral.darken5 }}>
                    {category.title}
                  </span>
                </div>
                <Toggle
                  name={category.key}
                  checked={category.locked ? true : enabled[category.key]}
                  disabled={category.locked}
                  onChange={(checked) => setCategoryEnabled(category.key, checked)}
                >
                  <span style={visuallyHidden}>{category.title}</span>
                </Toggle>
              </div>
              <Typography color="neutral-darken5">{category.description}</Typography>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
