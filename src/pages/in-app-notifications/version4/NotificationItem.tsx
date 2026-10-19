import type { ReactNode } from 'react'
import { ButtonGhost, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'
import approvalRequestIcon from '../../../assets/in-app-notifications/approval-request.svg'
import templateImportIcon from '../../../assets/in-app-notifications/template-import.svg'
import documentSharedIcon from '../../../assets/in-app-notifications/document-shared.svg'
import templateExportIcon from '../../../assets/in-app-notifications/template-export.svg'
import unreadDot from '../../../assets/in-app-notifications/unread-dot.svg'
import { timeLabel, type AppNotification, type NotificationKind, type NotificationStatusTone } from './data'

// The theme's "primary" family is only resolved at runtime by ThemeProvider,
// so it isn't available as a static hex in `colorPalette` — this is the BLUE
// theme's primary.lighten5, the unread row tint in the design.
const UNREAD_BACKGROUND_COLOR = '#EBF4FF'

// The notification-type glyphs have no GOAT-UI equivalent, so they're the
// SVGs exported from the Figma file.
const KIND_ICONS: Record<NotificationKind, string> = {
  'approval-request': approvalRequestIcon,
  'template-import': templateImportIcon,
  'document-shared': documentSharedIcon,
  'template-export': templateExportIcon,
}

const STATUS_ICONS: Record<NotificationStatusTone, { type: string; color: 'info-base' | 'danger-base' | 'success-base' }> = {
  info: { type: iconType.InfoCircleFilled, color: 'info-base' },
  danger: { type: iconType.AlertFilled, color: 'danger-base' },
  success: { type: iconType.CheckCircleFilled, color: 'success-base' },
}

interface NotificationItemProps {
  notification: AppNotification
  now: Date
  onOpen: () => void
  /** Marks this one notification read without opening it — offered on unread rows. */
  onMarkRead: () => void
  /** Rendered at the row's right edge, outside the clickable area (e.g. a row-actions menu). */
  trailing?: ReactNode
}

/** One notification, as designed for the popover — reused as-is on the full page. */
export function NotificationItem({ notification, now, onOpen, onMarkRead, trailing }: NotificationItemProps) {
  const unread = !notification.read
  const status = notification.status && STATUS_ICONS[notification.status.tone]

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        borderRadius: 8,
        backgroundColor: unread ? UNREAD_BACKGROUND_COLOR : undefined,
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          cursor: 'pointer',
          display: 'flex',
          gap: 4,
          alignItems: 'flex-start',
          flex: 1,
          minWidth: 0,
          padding: 12,
        }}
      >
        {unread && <img src={unreadDot} alt="Unread" width={16} height={16} style={{ display: 'block', flexShrink: 0 }} />}

        <div style={{ display: 'flex', flex: 1, minWidth: 0, gap: 8, alignItems: 'flex-start' }}>
          <img src={KIND_ICONS[notification.kind]} alt="" width={20} height={20} style={{ display: 'block', flexShrink: 0 }} />

          <div style={{ display: 'flex', flex: 1, minWidth: 0, flexDirection: 'column', gap: 8 }}>
            <Typography size="base-sm" color="neutral-darken5">
              <>
                {notification.message.map((part, index) =>
                  part.bold ? (
                    <strong key={index} style={{ fontWeight: 600 }}>
                      {part.text}
                    </strong>
                  ) : (
                    <span key={index}>{part.text}</span>
                  ),
                )}
              </>
            </Typography>

            {notification.status && status && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon type={status.type} color={status.color} size={16} />
                <Typography size="base-sm" weight="semibold" color="neutral-darken5">
                  {notification.status.label}
                </Typography>
              </div>
            )}

            <Typography size="base-sm" color="neutral-darken2">
              {timeLabel(notification.createdAt, now)}
            </Typography>
          </div>
        </div>
      </button>

      {trailing && <div style={{ padding: '8px 8px 0 0', flexShrink: 0 }}>{trailing}</div>}

      {/* Always shown on unread rows, at the right end of the timestamp line —
          that line is short, so the labelled button fits without narrowing
          the message. It sits outside the row's button, so it marks the
          notification read without opening it. */}
      {unread && (
        <div style={{ position: 'absolute', right: 8, bottom: 9 }}>
          <ButtonGhost size="small" leftIcon={iconType.CheckOutlined} onClick={onMarkRead}>
            Mark as read
          </ButtonGhost>
        </div>
      )}
    </div>
  )
}

/** The "all caught up" empty state from the design (Figma 5901:42763). */
export function CaughtUpState({ title = 'You’re all caught up', description = 'New notifications will appear here.', action }: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 }}>
      <Icon type={iconType.BellOutlined} size={32} color="neutral-darken2" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <Typography size="base-lg" weight="semibold" color="neutral-darken5" align="center">
          {title}
        </Typography>
        <Typography color="neutral-darken2" align="center">
          {description}
        </Typography>
      </div>
      {action}
    </div>
  )
}
