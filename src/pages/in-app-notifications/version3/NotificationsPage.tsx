import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonTertiary,
  constants,
  Dropdown,
  iconType,
  Pagination,
  SearchBar,
  Select,
  Tabs,
  toastPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { groupByDate, KIND_LABELS, messageText, type AppNotification, type NotificationKind } from './data'
import { CaughtUpState, NotificationItem, SelectionBar } from './NotificationItem'
import PrototypeLayout from './PrototypeLayout'
import { deleteNotification, markNotificationsRead, setNotificationRead, useAppNotifications } from './store'

const { colorPalette } = constants

const PAGE_SIZE = 20

type ReadFilter = 'all' | 'unread'

const TYPE_OPTIONS = (Object.keys(KIND_LABELS) as NotificationKind[]).map((kind) => ({ label: KIND_LABELS[kind], value: kind }))

function RowActions({ notification, onDelete }: { notification: AppNotification; onDelete: () => void }) {
  return (
    <Dropdown
      items={[
        notification.read
          ? { key: 'unread', label: 'Mark as unread', onClick: () => setNotificationRead(notification.id, false) }
          : { key: 'read', label: 'Mark as read', onClick: () => setNotificationRead(notification.id, true) },
        {
          key: 'delete',
          label: (
            <Typography as="span" color="danger-darken2">
              Delete
            </Typography>
          ),
          onClick: onDelete,
        },
      ]}
    >
      <ButtonGhost size="small" leftIcon={iconType.ThreeDotsHorFilled} ariaLabel="Notification actions" />
    </Dropdown>
  )
}

// The full notification history behind the popover's "View all
// notifications": the same rows, but with room for what the popover can't
// fit — search, filtering by type and status, pagination, and per-row
// actions (mark as read / unread, delete). Unread rows can be selected and
// marked read together. Layout follows the Figma "Notification center"
// frames (5923:22045, 5923:35659).
export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notification: toast } = useNotifications()
  const notifications = useAppNotifications()
  const [now] = useState(() => new Date())

  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<NotificationKind[]>([])
  const [statusFilter, setStatusFilter] = useState<string>()
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  // Only statuses that actually occur are offered as filters.
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(notifications.flatMap((notification) => (notification.status ? [notification.status.label] : [])))).map(
        (label) => ({ label, value: label }),
      ),
    [notifications],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return notifications.filter(
      (notification) =>
        (readFilter === 'all' || !notification.read) &&
        (typeFilter.length === 0 || typeFilter.includes(notification.kind)) &&
        (!statusFilter || notification.status?.label === statusFilter) &&
        (!query || messageText(notification).toLowerCase().includes(query)),
    )
  }, [notifications, readFilter, typeFilter, statusFilter, search])

  // Deleting the last item on the last page would otherwise leave it empty.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Selection covers the unread notifications on the current page; anything
  // that becomes read another way drops out of it.
  const selectable = pageItems.filter((notification) => !notification.read)
  const selected = selectedIds.filter((id) => selectable.some((notification) => notification.id === id))

  const toggleSelected = (id: string, checked: boolean) =>
    setSelectedIds((current) => (checked ? [...current, id] : current.filter((selectedId) => selectedId !== id)))

  const markSelectedRead = () => {
    markNotificationsRead(selected)
    setSelectedIds([])
    toast.success({
      title: `${selected.length} notification${selected.length === 1 ? '' : 's'} marked as read`,
      placement: toastPlacements.TOP_RIGHT,
    })
  }

  const changePage = (nextPage: number) => {
    setPage(nextPage)
    setSelectedIds([])
  }

  const hasFieldFilters = search.trim() !== '' || typeFilter.length > 0 || statusFilter !== undefined

  // Any change to what's shown starts again from the first page, with
  // nothing selected.
  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      changePage(1)
    }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter([])
    setStatusFilter(undefined)
    changePage(1)
  }

  const handleDelete = (id: string) => {
    deleteNotification(id)
    toast.success({ title: 'Notification deleted', placement: toastPlacements.TOP_RIGHT })
  }

  let list
  if (filtered.length === 0 && hasFieldFilters) {
    list = (
      <CaughtUpState
        title="No notifications match your filters"
        description="Try a different search term, or clear the filters to see everything."
        action={<ButtonTertiary onClick={clearFilters}>Clear filters</ButtonTertiary>}
      />
    )
  } else if (filtered.length === 0) {
    list = <CaughtUpState />
  } else {
    list = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groupByDate(pageItems, now).map((group) => (
          <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography size="base-sm" weight="semibold" color="neutral-darken2">
              {group.label}
            </Typography>
            {group.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                now={now}
                onOpen={() => setNotificationRead(notification.id, true)}
                menu={<RowActions notification={notification} onDelete={() => handleDelete(notification.id)} />}
                selection={
                  notification.read
                    ? undefined
                    : { checked: selected.includes(notification.id), onChange: (checked) => toggleSelected(notification.id, checked) }
                }
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <PrototypeLayout>
      <div style={{ height: '100%', minHeight: 0, overflowY: 'auto', backgroundColor: colorPalette.neutral.lighten5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 952, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography as="h1" size="heading-xl" weight="semibold" color="neutral-darken5">
                Notifications
              </Typography>
            </div>
            {/* Relative, so it stays within this version's routes. */}
            <ButtonGhost leftIcon={iconType.GearOutlined} onClick={() => navigate('../settings')}>
              Settings
            </ButtonGhost>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px 16px' }}>
            <div style={{ padding: '0 16px' }}>
              <Typography size="base-lg" color="neutral-darken5">
                Approval requests, shared documents and template imports and exports.
              </Typography>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: '24px 16px',
                borderRadius: 16,
                backgroundColor: colorPalette.white,
              }}
            >
              <Tabs
                activeKey={readFilter}
                onChange={withPageReset((key: string) => setReadFilter(key as ReadFilter))}
                options={[
                  { key: 'all', label: 'All', content: null },
                  { key: 'unread', label: `Unread (${unreadCount})`, content: null },
                ]}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SearchBar placeholder="Search notifications" value={search} onChange={withPageReset(setSearch)} width="expanded" />
                </div>
                <div style={{ width: 240, flexShrink: 0 }}>
                  <Select
                    name="type"
                    placeholder="All types"
                    mode="multiple"
                    options={TYPE_OPTIONS}
                    value={typeFilter}
                    onChange={withPageReset((value) => setTypeFilter(Array.isArray(value) ? (value as NotificationKind[]) : []))}
                  />
                </div>
                <div style={{ width: 240, flexShrink: 0 }}>
                  <Select
                    name="status"
                    placeholder="All statuses"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={withPageReset((value) => setStatusFilter(value ? String(value) : undefined))}
                  />
                </div>
              </div>

              {hasFieldFilters && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
                  <ButtonTertiary size="small" onClick={clearFilters}>
                    Clear filters
                  </ButtonTertiary>
                </div>
              )}

              {selectable.length > 0 && (
                <SelectionBar
                  selectedCount={selected.length}
                  selectableCount={selectable.length}
                  onSelectAll={(selectAll) => setSelectedIds(selectAll ? selectable.map((notification) => notification.id) : [])}
                  onMarkRead={markSelectedRead}
                  selectAllLabel={readFilter === 'unread' ? 'Select all' : 'Select all unread'}
                />
              )}

              {list}

              {filtered.length > PAGE_SIZE && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Pagination current={currentPage} total={filtered.length} pageSize={PAGE_SIZE} onChange={changePage} showTotal />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PrototypeLayout>
  )
}
