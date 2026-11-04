import { constants, Typography } from '@goat-ui/goat-ui-core'

const { colorPalette } = constants

// The label / value list at the top of the Finish document dialog, so the
// user can check what's being filed where before confirming.
export default function DocumentSummary({ rows }: { rows: { label: string; value: string; note?: string; strong?: boolean }[] }) {
  return (
    <div style={{ border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8 }}>
      {rows.map((row, index) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            gap: 16,
            padding: '10px 16px',
            borderTop: index === 0 ? 'none' : `1px solid ${colorPalette.neutral.lighten2}`,
          }}
        >
          <div style={{ width: 140, flexShrink: 0 }}>
            <Typography color="neutral-darken2">{row.label}</Typography>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
            <Typography as="span" weight={row.strong ? 'semibold' : undefined}>
              {row.value}
            </Typography>
            {row.note && (
              <Typography as="span" size="base-sm" color="neutral-darken2">
                {row.note}
              </Typography>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
