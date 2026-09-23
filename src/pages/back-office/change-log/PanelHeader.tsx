import { ButtonGhost, constants, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'
import type { StatusTone } from './data'

const { colorPalette } = constants

interface PanelHeaderProps {
  title: string
  statusLabel?: string
  statusTone?: StatusTone
  onClose: () => void
}

// The DS Chip renders block elements, which the browser refuses to nest inside
// the Panel's <p> title — it closes the <p> early and the pill lands on top of
// the title. So the pill is built from spans here, using the same semantic
// tokens the Chip would.
function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: colorPalette[tone].lighten4,
        color: colorPalette[tone].darken2,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '16px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

// Rendered as the Panel's `title` — the Panel wraps `title` in a native <p>,
// so every element here must be inline/"phrasing" content (spans, buttons —
// never a div) or the browser silently closes that <p> early and breaks the
// buttons nested after it.
export default function PanelHeader({ title, statusLabel, statusTone, onClose }: PanelHeaderProps) {
  return (
    <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <span
          style={{
            // Long template names wrap up to two lines; anything past that
            // is ellipsis-truncated rather than growing the header indefinitely.
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <Typography as="span" size="heading-lg" weight="semibold">
            {title}
          </Typography>
        </span>

        {statusLabel && statusTone && <StatusPill label={statusLabel} tone={statusTone} />}
      </span>

      <ButtonGhost onClick={onClose} ariaLabel="Close">
        <Icon type={iconType.CrossOutlined} />
      </ButtonGhost>
    </span>
  )
}
