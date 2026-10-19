import { chipStyles, chipVariants, iconType } from '@goat-ui/goat-ui-core'
import type { AnchorItem } from '@goat-ui/goat-ui-core'

export type NotificationKind = 'approval-request' | 'template-import' | 'document-shared' | 'template-export'
export type NotificationStatusTone = 'info' | 'danger' | 'success'

/** A run of message text — `bold` runs are the actor and the item acted on. */
export interface MessagePart {
  text: string
  bold?: boolean
}

export interface AppNotification {
  id: string
  kind: NotificationKind
  message: MessagePart[]
  status?: { tone: NotificationStatusTone; label: string }
  createdAt: Date
  read: boolean
}

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function startOfDay(date: Date) {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

/** Today, then the rest of the past 7 days, then one group per month. */
export function groupFor(date: Date, now: Date): { key: string; label: string } {
  const today = startOfDay(now)
  if (date >= today) return { key: 'today', label: 'Today' }
  if (date >= new Date(today.getTime() - 6 * DAY)) return { key: 'this-week', label: 'This week' }
  return {
    key: `${date.getFullYear()}-${date.getMonth()}`,
    label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
  }
}

/** Relative for anything from today ("2 hours ago"), a date otherwise. */
export function timeLabel(date: Date, now: Date) {
  if (date < startOfDay(now)) return formatDate(date)
  const minutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / 60000))
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'} ago`
}

export interface NotificationGroup {
  key: string
  label: string
  items: AppNotification[]
}

/** Splits an already newest-first list into consecutive date groups. */
export function groupByDate(notifications: AppNotification[], now: Date): NotificationGroup[] {
  const groups: NotificationGroup[] = []
  for (const notification of notifications) {
    const { key, label } = groupFor(notification.createdAt, now)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(notification)
    else groups.push({ key, label, items: [notification] })
  }
  return groups
}

export const KIND_LABELS: Record<NotificationKind, string> = {
  'approval-request': 'Approval requests',
  'document-shared': 'Shared documents',
  'template-import': 'Template imports',
  'template-export': 'Template exports',
}

/** The plain text of a message, for search. */
export function messageText(notification: AppNotification) {
  return notification.message.map((part) => part.text).join('')
}

const PEOPLE = ['John Smith', 'Anna Becker', 'Lukas Weber', 'Sofia Klein', 'Max Hoffmann', 'Emma Fischer']
const DOCUMENTS = ['Arbeitsvertrag Teilzeit', 'Aufhebungsvertrag', 'Abmahnung', 'Arbeitszeugnis', 'Elternzeitantrag', 'Dienstwagenvereinbarung']
const TEMPLATES = ['Arbeitsvertrag Minijob', 'Fortbildungsvertrag', 'Homeoffice-Vereinbarung', 'Kündigung Probezeit', 'Bonusvereinbarung']

/** Builds the nth older notification — cycling through every kind and
 *  outcome so a long history mixes them the way a real one would. */
function olderNotification(index: number, createdAt: Date): AppNotification {
  const person = PEOPLE[index % PEOPLE.length]
  const document = DOCUMENTS[index % DOCUMENTS.length]
  const template = TEMPLATES[index % TEMPLATES.length]
  const id = `n${index + 5}`
  // Most of the history is read; an occasional older item is still waiting.
  const read = index % 11 !== 3

  switch (index % 5) {
    case 0:
      return {
        id,
        kind: 'approval-request',
        message: [{ text: person, bold: true }, { text: ' has requested your approval for ' }, { text: document, bold: true }, { text: '.' }],
        status: read ? { tone: 'success', label: 'Approved' } : { tone: 'info', label: 'Action required' },
        createdAt,
        read,
      }
    case 1:
      return {
        id,
        kind: 'document-shared',
        message: [{ text: person, bold: true }, { text: ' has shared ' }, { text: document, bold: true }, { text: ' with you.' }],
        createdAt,
        read,
      }
    case 2:
      return {
        id,
        kind: 'template-export',
        message: [{ text: 'Your', bold: true }, { text: ' template export for ' }, { text: template, bold: true }, { text: ' was successful.' }],
        status: { tone: 'success', label: 'Successful' },
        createdAt,
        read,
      }
    case 3:
      return {
        id,
        kind: 'template-import',
        message: [{ text: 'Your', bold: true }, { text: ' template import for ' }, { text: template, bold: true }, { text: ' was successful.' }],
        status: { tone: 'success', label: 'Successful' },
        createdAt,
        read,
      }
    default:
      return {
        id,
        kind: 'template-import',
        message: [{ text: 'Your', bold: true }, { text: ' template import for ' }, { text: template, bold: true }, { text: ' was unsuccessful.' }],
        status: { tone: 'danger', label: 'Unsuccessful' },
        createdAt,
        read,
      }
  }
}

export const NOTIFICATION_HISTORY_SIZE = 50

/** The four notifications from the design, followed by an older history
 *  spread over the past few months — dated relative to `now` so "Today"
 *  and "This week" are always populated. */
export function createNotifications(now: Date): AppNotification[] {
  const ago = (ms: number) => new Date(now.getTime() - ms)

  const recent: AppNotification[] = [
    {
      id: 'n1',
      kind: 'approval-request',
      message: [
        { text: 'John Smith', bold: true },
        { text: ' has requested your approval for ' },
        { text: 'Arbeitsvertrag Vollzeit', bold: true },
        { text: '.' },
      ],
      status: { tone: 'info', label: 'Action required' },
      createdAt: ago(2 * HOUR),
      read: false,
    },
    {
      id: 'n2',
      kind: 'template-import',
      message: [
        { text: 'Your', bold: true },
        { text: ' template import for ' },
        { text: 'Betriebsvereinbarung Mobiles Arbeiten', bold: true },
        { text: ' was unsuccessful.' },
      ],
      status: { tone: 'danger', label: 'Unsuccessful' },
      createdAt: ago(2 * DAY),
      read: false,
    },
    {
      id: 'n3',
      kind: 'document-shared',
      message: [
        { text: 'John Smith', bold: true },
        { text: ' has shared ' },
        { text: 'Gehaltsanpassung 2026', bold: true },
        { text: ' with you.' },
      ],
      createdAt: ago(3 * DAY),
      read: true,
    },
    {
      id: 'n4',
      kind: 'template-export',
      message: [
        { text: 'Your', bold: true },
        { text: ' template export for ' },
        { text: 'Arbeitszeugnis qualifiziert', bold: true },
        { text: ' was successful.' },
      ],
      status: { tone: 'success', label: 'Successful' },
      createdAt: ago(4 * DAY),
      read: true,
    },
  ]

  // About one a day at first, thinning out further back.
  const older = Array.from({ length: NOTIFICATION_HISTORY_SIZE - recent.length }, (_, index) =>
    olderNotification(index, ago(5 * DAY + index * index * 0.05 * DAY + index * 0.6 * DAY + (index % 3) * 3 * HOUR)),
  )

  return [...recent, ...older]
}

function logicChip(number: number) {
  return {
    label: `Logik ${number}`,
    leftIcon: iconType.TreeDiagramOutlined,
    chipStyle: chipStyles.ACCENT_NEUTRAL,
    variant: chipVariants.SUBTLE,
    uppercase: true,
  }
}

const SECTIONS: { title: string; logic?: number }[] = [
  { title: 'Vertragstitel' },
  { title: 'Vertragsparteien' },
  { title: 'Beginn des Anstellungsverhältnisses / Probezeit / Tätigkeit / Ort / Vorbehalte' },
  { title: 'Arbeitszeit - Wochenstunden' },
  { title: 'Arbeitszeit - Pausenzeiten' },
  { title: 'Vergütung - Stundenlohn', logic: 1 },
  { title: 'Vergütung - Monatslohn ohne Weihnachtsgeld', logic: 1 },
  { title: 'Vergütung - Monatslohn mit Weihnachtsgeld', logic: 1 },
  { title: 'Urlaub - mit Zusatzurlaub', logic: 2 },
  { title: 'Urlaub - ohne Zusatzurlaub', logic: 2 },
  { title: 'Arbeitsverhinderung' },
  { title: 'Verschwiegenheitspflicht' },
  { title: 'Weitere Beschäftigungen' },
  { title: 'Hinweis zur gesetzlichen Rentenversicherung' },
  { title: 'Kündigung - lange Variante', logic: 3 },
  { title: 'Kündigung - kurze Variante', logic: 3 },
  { title: 'Ausschlussklausel' },
  { title: 'Betriebliche und tarifliche Regelungen / Öffnungsklausel' },
  { title: 'Nebenabreden / Schriftform' },
  { title: 'Unterschrift' },
]

export const TEMPLATE_SECTIONS: AnchorItem[] = SECTIONS.map((section, index) => ({
  key: `section-${index + 1}`,
  href: `#section-${index + 1}`,
  title: section.title,
  ...(section.logic && { chip: logicChip(section.logic) }),
}))
