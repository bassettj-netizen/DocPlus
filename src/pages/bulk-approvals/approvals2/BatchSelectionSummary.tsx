import { ButtonGhost, Chip, chipStyles, constants, Typography } from '@goat-ui/goat-ui-core'
import type { ChipStyleValue } from '@goat-ui/goat-ui-core'
import type { ApprovalDocument, ApprovalStatus } from './data'

const { colorPalette } = constants

const STATUS_CHIP: Record<ApprovalStatus, { label: string; chipStyle: ChipStyleValue }> = {
  pending: { label: 'Pending', chipStyle: chipStyles.ACCENT_NEUTRAL },
  approved: { label: 'Approved', chipStyle: chipStyles.SEMANTIC_SUCCESS },
  rejected: { label: 'Rejected', chipStyle: chipStyles.SEMANTIC_DANGER },
}

interface BatchSelectionSummaryProps {
  documents: ApprovalDocument[]
  onUndo: (id: string) => void
}

// Shown instead of a single document preview whenever more than one row is
// selected — spelling out exactly which documents Reject/Approve will act
// on next, so a multi-select never has to be inferred from checkboxes alone.
export default function BatchSelectionSummary({ documents, onUndo }: BatchSelectionSummaryProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 640,
        backgroundColor: colorPalette.white,
        border: `1px solid ${colorPalette.neutral.lighten2}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 24,
      }}
    >
      <Typography size="base-lg" weight="semibold">
        {`${documents.length} documents selected`}
      </Typography>
      <Typography color="neutral-darken2">
        Reject or Approve above will apply to every document listed here.
      </Typography>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
        {documents.map((doc) => {
          const status = STATUS_CHIP[doc.status]
          return (
            <div
              key={doc.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 0',
                borderBottom: `1px solid ${colorPalette.neutral.lighten1}`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <Typography weight="semibold">{doc.employeeName}</Typography>
                <Typography size="base-sm" color="neutral-darken2">
                  {doc.position} • {doc.organisation}
                </Typography>
              </div>

              <Chip label={status.label} chipStyle={status.chipStyle} uppercase />

              {doc.status !== 'pending' && <ButtonGhost onClick={() => onUndo(doc.id)}>Undo</ButtonGhost>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
