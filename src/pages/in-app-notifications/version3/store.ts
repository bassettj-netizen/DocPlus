import { useSyncExternalStore } from 'react'
import { createNotifications, type AppNotification } from './data'

// The bell popover (on every page) and the full Notifications page show the
// same list, so reading or deleting a notification in one is reflected in
// the other — without a real backend. Same minimal module-level store +
// pub/sub as Back Office's change-log/store.ts. Newest first.
let notifications: AppNotification[] = createNotifications(new Date())
const listeners = new Set<() => void>()

function update(next: AppNotification[]) {
  notifications = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return notifications
}

export function setNotificationRead(id: string, read: boolean) {
  update(notifications.map((notification) => (notification.id === id ? { ...notification, read } : notification)))
}

export function markNotificationsRead(ids: string[]) {
  const selected = new Set(ids)
  update(notifications.map((notification) => (selected.has(notification.id) ? { ...notification, read: true } : notification)))
}

export function markAllNotificationsRead() {
  update(notifications.map((notification) => ({ ...notification, read: true })))
}

export function deleteNotification(id: string) {
  update(notifications.filter((notification) => notification.id !== id))
}

export function useAppNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
