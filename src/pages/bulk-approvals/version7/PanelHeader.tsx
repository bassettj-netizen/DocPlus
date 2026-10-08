import { ButtonGhost, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'

interface PanelHeaderProps {
  title: string
  onBack?: () => void
  onClose: () => void
}

// Rendered as the Panel's `title` — the Panel wraps `title` in a native <p>,
// so every element here must be inline/"phrasing" content (spans, buttons —
// never a div) or the browser silently closes that <p> early and breaks the
// buttons nested after it.
export default function PanelHeader({ title, onBack, onClose }: PanelHeaderProps) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
      {onBack && (
        <ButtonGhost onClick={onBack} ariaLabel="Back">
          <Icon type={iconType.ChevronLeftOutlined} />
        </ButtonGhost>
      )}
      <span style={{ display: 'inline-block', flex: 1 }}>
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
