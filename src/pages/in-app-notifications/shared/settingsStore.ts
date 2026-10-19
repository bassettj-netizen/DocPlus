import { useSyncExternalStore } from 'react'

export type NotificationCategory = 'template-imports' | 'template-exports' | 'requests' | 'shared-documents'

export interface NotificationCategorySetting {
  key: NotificationCategory
  title: string
  description: string
  /** Can't be switched off — shown as an on, disabled toggle. */
  locked?: boolean
}

export const NOTIFICATION_CATEGORIES: NotificationCategorySetting[] = [
  { key: 'template-imports', title: 'Template imports', description: 'Success and failures' },
  { key: 'template-exports', title: 'Template exports', description: 'Success and failures' },
  // Requests need the user to act (approve, provide information, sign), so
  // the design shows them always on.
  { key: 'requests', title: 'Requests', description: 'Approval, information, signatures', locked: true },
  { key: 'shared-documents', title: 'Shared documents', description: 'Documents shared with you' },
]

// Which notification categories the user receives — shared by every
// In-app notifications version, so a choice made from one version's
// Settings screen is still there in another. Same minimal module-level
// store + pub/sub as the versions' own notification stores. Defaults match
// the design.
let enabled: Record<NotificationCategory, boolean> = {
  'template-imports': true,
  'template-exports': true,
  requests: true,
  'shared-documents': false,
}
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return enabled
}

export function setCategoryEnabled(category: NotificationCategory, value: boolean) {
  enabled = { ...enabled, [category]: value }
  listeners.forEach((listener) => listener())
}

export function useNotificationSettings() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
