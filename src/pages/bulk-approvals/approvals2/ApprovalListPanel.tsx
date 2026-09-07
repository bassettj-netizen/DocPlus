import { Checkbox, Chip, chipStyles, constants, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'
import type { ChipStyleValue } from '@goat-ui/goat-ui-core'
import type { ApprovalDocument, ApprovalStatus } from './data'

const { colorPalette } = constants

// The theme's "primary" family is only resolved at runtime by ThemeProvider,
// so it isn't available as a static hex in `colorPalette` — matches the
// BLUE theme's primary.lighten5 used for the selected-row highlight
// elsewhere (see version4/DocumentPreview.tsx).
const SELECTED_ROW_BACKGROUND_COLOR = '#EAF1FF'

const STATUS_CHIP: Record<ApprovalStatus, { label: string; chipStyle: ChipStyleValue }> = {
  pending: { label: 'Pending', chipStyle: chipStyles.ACCENT_NEUTRAL },
  approved: { label: 'Approved', chipStyle: chipStyles.SEMANTIC_SUCCESS },
  rejected: { label: 'Rejected', chipStyle: chipStyles.SEMANTIC_DANGER },
}

interface ApprovalListPanelProps {
  documents: ApprovalDocument[]
  selectedIds: Set<string>
  onOpenOnly: (id: string) => void
  onToggleSelected: (id: string) => void
  onToggleAllSelected: () => void
}

// Unlike Approvals 1, there is exactly one selection set here: a row is
// checked if and only if it's highlighted and included in whatever Reject/
// Approve acts on next — no separate "open" vs "checked" state to confuse.
// Clicking a row's body selects it exclusively (the common one-at-a-time
// flow); clicking its checkbox adds/removes it from a growing batch without
// disturbing the rest of the selection.
export default function ApprovalListPanel({
  documents,
  selectedIds,
  onOpenOnly,
  onToggleSelected,
  onToggleAllSelected,
}: ApprovalListPanelProps) {
  const allSelected = documents.length > 0 && documents.every((doc) => selectedIds.has(doc.id))
  const someSelected = documents.some((doc) => selectedIds.has(doc.id))

  return (
    <div
      style={{
        backgroundColor: colorPalette.white,
        width: 550,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: 16,
          borderBottom: `1px solid ${colorPalette.neutral.lighten1}`,
        }}
      >
        <Checkbox
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          onChange={onToggleAllSelected}
          disabled={documents.length === 0}
        >
          {selectedIds.size > 0 ? `${selectedIds.size} selected` : `Select ${documents.length} documents`}
        </Checkbox>
      </div>

      {documents.map((doc) => {
        const status = STATUS_CHIP[doc.status]
        const isSelected = selectedIds.has(doc.id)
        return (
          <div
            key={doc.id}
            onClick={() => onOpenOnly(doc.id)}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              width: '100%',
              padding: 16,
              borderRadius: 0,
              borderBottom: `1px solid ${colorPalette.neutral.lighten1}`,
              backgroundColor: isSelected ? SELECTED_ROW_BACKGROUND_COLOR : undefined,
              cursor: 'pointer',
            }}
          >
            {doc.status === 'pending' ? (
              <div onClick={(event) => { event.stopPropagation(); onToggleSelected(doc.id) }}>
                <Checkbox checked={isSelected} onChange={() => {}} />
              </div>
            ) : (
              <div
                onClick={(event) => { event.stopPropagation(); onToggleSelected(doc.id) }}
                style={{ display: 'flex', alignItems: 'center', padding: '2px 0', cursor: 'pointer' }}
              >
                <Icon
                  type={doc.status === 'approved' ? iconType.CheckCircleFilled : iconType.CrossFilled}
                  color={doc.status === 'approved' ? 'success-base' : 'danger-base'}
                  size={16}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <Typography weight="semibold">{doc.employeeName}</Typography>
              <Typography size="base-sm" color="neutral-darken2">
                {doc.position} • {doc.organisation}
              </Typography>
            </div>

            <Chip label={status.label} chipStyle={status.chipStyle} uppercase />
          </div>
        )
      })}
    </div>
  )
}
