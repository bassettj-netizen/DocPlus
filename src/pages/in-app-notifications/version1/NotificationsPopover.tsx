import { useEffect, useRef, useState } from 'react'
import {
  Badge,
  ButtonGhost,
  ButtonSecondary,
  constants,
  Icon,
  iconType,
  PopOver,
  popOverPlacements,
  popOverTriggers,
  Segmented,
  Spinner,
  Typography,
} from '@goat-ui/goat-ui-core'
import { groupByDate, type AppNotification } from './data'
import { CaughtUpState, NotificationItem } from './NotificationItem'

const { colorPalette } = constants

const POPOVER_WIDTH = 380
// The installed PopOver only caps its width (minWidth arrives in v25), so
// the content is sized to the design's inner width (380px less 8px padding
// either side) to keep the panel from shrinking to fit short lists.
const CONTENT_WIDTH = 364

// Only the list scrolls — the title, All / Unread switch and footer stay put.
// It shrinks on short viewports so the whole panel always fits on screen.
const LIST_MAX_HEIGHT = 'min(440px, calc(100vh - 260px))'

// How many notifications are rendered up front, and how many more each time
// the user scrolls to the bottom of the list.
const BATCH_SIZE = 15
// Stands in for the request that would fetch the next page from the server.
const LOAD_DELAY_MS = 600

type Filter = 'all' | 'unread'

interface NotificationsPopoverProps {
  /** Newest first. */
  notifications: AppNotification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onViewAll: () => void
  /** Opens the notification settings screen. */
  onOpenSettings: () => void
}

export default function NotificationsPopover({ notifications, onMarkRead, onMarkAllRead, onViewAll, onOpenSettings }: NotificationsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  // Captured when the panel opens, so relative times and date groups don't
  // shift while it's being read.
  const [now, setNow] = useState(() => new Date())

  const listRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((notification) => !notification.read).length
  const filtered = filter === 'unread' ? notifications.filter((notification) => !notification.read) : notifications
  const shown = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // Every time the panel opens, or the filter changes, the list starts again
  // from the top with just the first batch.
  const resetList = () => {
    setVisibleCount(BATCH_SIZE)
    setLoadingMore(false)
    listRef.current?.scrollTo({ top: 0 })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setNow(new Date())
      resetList()
    }
  }

  const handleFilterChange = (value: string | number) => {
    setFilter(value as Filter)
    resetList()
  }

  // Loads the next batch once the bottom of the list scrolls into view.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!open || !hasMore || loadingMore || !sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setLoadingMore(true)
      },
      { root: listRef.current, rootMargin: '0px 0px 80px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, hasMore, loadingMore, visibleCount, filter])

  useEffect(() => {
    if (!loadingMore) return
    const timeout = window.setTimeout(() => {
      setVisibleCount((count) => count + BATCH_SIZE)
      setLoadingMore(false)
    }, LOAD_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [loadingMore])

  const handleOpenSettings = () => {
    setOpen(false)
    onOpenSettings()
  }

  const handleViewAll = () => {
    setOpen(false)
    onViewAll()
  }

  const header = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: CONTENT_WIDTH }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography weight="semibold" color="neutral-darken5">
            Notifications
          </Typography>
        </div>
        {/* Nothing to mark once everything is read, so the design drops it. */}
        {unreadCount > 0 && (
          <ButtonSecondary size="small" onClick={onMarkAllRead}>
            Mark all as read
          </ButtonSecondary>
        )}
        <ButtonGhost leftIcon={iconType.GearOutlined} ariaLabel="Notification settings" onClick={handleOpenSettings} />
      </div>
      <div className="notifications-segmented">
        <Segmented
          value={filter}
          onChange={handleFilterChange}
          options={[
            { label: 'All', value: 'all' },
            { label: `Unread (${unreadCount})`, value: 'unread' },
          ]}
        />
      </div>
    </div>
  )

  const list =
    shown.length === 0 ? (
      <CaughtUpState />
    ) : (
      <div ref={listRef} style={{ maxHeight: LIST_MAX_HEIGHT, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groupByDate(shown, now).map((group) => (
            <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Pinned while its group scrolls past, so it's always clear
                  how old the notifications in view are. */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  padding: '4px 4px',
                  backgroundColor: colorPalette.white,
                }}
              >
                <Typography size="base-sm" weight="semibold" color="neutral-darken2">
                  {group.label}
                </Typography>
              </div>
              {group.items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  now={now}
                  onOpen={() => onMarkRead(notification.id)}
                />
              ))}
            </div>
          ))}
        </div>

        {hasMore ? (
          <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: 16, minHeight: 56 }}>
            {loadingMore && <Spinner spinning size="small" />}
          </div>
        ) : (
          <div style={{ padding: '16px 12px 8px' }}>
            <Typography size="base-sm" color="neutral-darken2" align="center">
              {filter === 'unread' ? "That's everything unread." : "You've reached the end of your notifications."}
            </Typography>
          </div>
        )}
      </div>
    )

  const footer = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: CONTENT_WIDTH,
        paddingTop: 8,
        borderTop: `1px solid ${colorPalette.neutral.lighten2}`,
      }}
    >
      <ButtonGhost size="small" onClick={handleViewAll}>
        View all notifications
      </ButtonGhost>
    </div>
  )

  return (
    <PopOver
      trigger={popOverTriggers.CLICK}
      placement={popOverPlacements.BOTTOM_RIGHT}
      open={open}
      onOpenChange={handleOpenChange}
      maxWidth={POPOVER_WIDTH}
      header={header}
      content={<div style={{ width: CONTENT_WIDTH }}>{list}</div>}
      footer={footer}
    >
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}
      >
        <Badge count={unreadCount}>
          <Icon type={iconType.BellOutlined} size={24} color="neutral-darken5" />
        </Badge>
      </button>
    </PopOver>
  )
}
