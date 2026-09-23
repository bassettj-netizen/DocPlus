import { ButtonGhost, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'

interface PanelHeaderProps {
  title: string
  onClose: () => void
}

// Rendered as the Panel's `title` — the Panel wraps `title` in a native <p>,
// so every element here must be inline/"phrasing" content (spans, buttons —
// never a div) or the browser silently closes that <p> early and breaks the
// buttons nested after it.
export default function PanelHeader({ title, onClose }: PanelHeaderProps) {
  return (
    <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%' }}>
      <span
        style={{
          // Long template names wrap up to two lines; anything past that is
          // ellipsis-truncated rather than growing the header indefinitely.
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        <Typography as="span" size="heading-lg" weight="semibold">
          {title}
        </Typography>
      </span>

      <ButtonGhost onClick={onClose} ariaLabel="Close">
        <Icon type={iconType.CrossOutlined} />
      </ButtonGhost>
    </span>
  )
}
