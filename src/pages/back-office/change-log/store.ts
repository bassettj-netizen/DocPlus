import { useSyncExternalStore } from 'react'
import { CHANGE_LOG_ENTRIES, type ChangeLogEntry } from './data'

// Change Log is the single source of truth for template-change history across
// Back Office — actions taken elsewhere (e.g. reviewing a Legal Change) call
// `addChangeLogEntry`/`updateChangeLogEntry` here so both pages read from the
// same list, without a real backend. A minimal module-level store + pub/sub
// is enough for that and avoids pulling in a state-management dependency.
let entries: ChangeLogEntry[] = CHANGE_LOG_ENTRIES
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return entries
}

export function addChangeLogEntry(entry: ChangeLogEntry) {
  entries = [entry, ...entries]
  emit()
}

export function updateChangeLogEntry(id: string, patch: Partial<ChangeLogEntry>) {
  entries = entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
  emit()
}

export function useChangeLogEntries() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
