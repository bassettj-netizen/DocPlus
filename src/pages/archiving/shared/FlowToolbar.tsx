import type { ReactNode } from 'react'
import { ProgressIndicator } from '@goat-ui/goat-ui-core'
import { FLOW_STEPS } from './data'

// Sampled from the Figma toolbar behind Back / Continue — a pale primary
// tint, not one of the named tokens in `colorPalette`.
const TOOLBAR_COLOR = '#DDE5FA'

/** Where the user is in FLOW_STEPS; FLOW_STEPS.length marks every step done. */
export function FlowSteps({ current }: { current: number }) {
  return (
    <div style={{ width: 640 }}>
      <ProgressIndicator items={FLOW_STEPS.map((title) => ({ title }))} current={current} />
    </div>
  )
}

interface FlowToolbarProps {
  left?: ReactNode
  center?: ReactNode
  right?: ReactNode
}

// The pale blue bar from the Figma create flow. Left and right share the
// leftover width equally, so the centre (the steps) stays centred whatever
// buttons sit either side of it.
export default function FlowToolbar({ left, center, right }: FlowToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 8,
        backgroundColor: TOOLBAR_COLOR,
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>{left}</div>
      {center}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>{right}</div>
    </div>
  )
}
