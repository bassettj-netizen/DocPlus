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
  selectedId: string
  onSelect: (id: string) => void
  checkedIds: Set<string>
  onToggleChecked: (id: string) => void
  onToggleAllChecked: () => void
}

export default function ApprovalListPanel({
  documents,
  selectedId,
  onSelect,
  checkedIds,
  onToggleChecked,
  onToggleAllChecked,
}: ApprovalListPanelProps) {
  const allChecked = documents.length > 0 && documents.every((doc) => checkedIds.has(doc.id))
  const someChecked = documents.some((doc) => checkedIds.has(doc.id))

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
          checked={allChecked}
          indeterminate={!allChecked && someChecked}
          onChange={onToggleAllChecked}
          disabled={documents.length === 0}
        >
          {checkedIds.size > 0 ? `${checkedIds.size} selected` : `Select ${documents.length} documents`}
        </Checkbox>
      </div>

      {documents.map((doc) => {
        const status = STATUS_CHIP[doc.status]
        const isSelected = doc.id === selectedId
        return (
          <div
            key={doc.id}
            onClick={() => onSelect(doc.id)}
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
              <div onClick={(event) => event.stopPropagation()}>
                <Checkbox checked={checkedIds.has(doc.id)} onChange={() => onToggleChecked(doc.id)} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
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
