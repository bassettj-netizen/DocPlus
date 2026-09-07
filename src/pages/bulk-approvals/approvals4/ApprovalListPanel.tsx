import { ButtonPrimary, ButtonSecondary, Checkbox, Chip, chipStyles, constants, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'
import type { ChipStyleValue } from '@goat-ui/goat-ui-core'
import type { ApprovalDocument, ApprovalStatus } from './data'

const { colorPalette } = constants

// The theme's "primary" family is only resolved at runtime by ThemeProvider,
// so it isn't available as a static hex in `colorPalette` — matches the
// BLUE theme's primary.lighten5 used for the open-row highlight elsewhere
// (see version4/DocumentPreview.tsx).
const OPEN_ROW_BACKGROUND_COLOR = '#EAF1FF'

const STATUS_CHIP: Record<ApprovalStatus, { label: string; chipStyle: ChipStyleValue }> = {
  pending: { label: 'Pending', chipStyle: chipStyles.ACCENT_NEUTRAL },
  approved: { label: 'Approved', chipStyle: chipStyles.SEMANTIC_SUCCESS },
  rejected: { label: 'Rejected', chipStyle: chipStyles.SEMANTIC_DANGER },
}

interface ApprovalListPanelProps {
  documents: ApprovalDocument[]
  openId: string
  onOpen: (id: string) => void
  checkedIds: Set<string>
  onToggleChecked: (id: string) => void
  onToggleAllChecked: () => void
  onBulkReject: () => void
  onBulkApprove: () => void
  onRowReject: (id: string) => void
  onRowApprove: (id: string) => void
}

// Same two independent controls as Approvals 3 — a row's body always opens
// it, a row's checkbox only ever feeds this panel's own bulk bar — but the
// single-document decision itself has moved down into the open row: as soon
// as a pending row is open and NOT checked, its own Reject/Approve replace
// the chip right there, instead of living in the document header above.
export default function ApprovalListPanel({
  documents,
  openId,
  onOpen,
  checkedIds,
  onToggleChecked,
  onToggleAllChecked,
  onBulkReject,
  onBulkApprove,
  onRowReject,
  onRowApprove,
}: ApprovalListPanelProps) {
  const pendingDocuments = documents.filter((doc) => doc.status === 'pending')
  const allChecked = pendingDocuments.length > 0 && pendingDocuments.every((doc) => checkedIds.has(doc.id))
  const someChecked = pendingDocuments.some((doc) => checkedIds.has(doc.id))

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
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          backgroundColor: checkedIds.size > 0 ? OPEN_ROW_BACKGROUND_COLOR : undefined,
          borderBottom: `1px solid ${colorPalette.neutral.lighten1}`,
        }}
      >
        <Checkbox
          checked={allChecked}
          indeterminate={!allChecked && someChecked}
          onChange={onToggleAllChecked}
          disabled={pendingDocuments.length === 0}
        >
          {checkedIds.size > 0 ? `${checkedIds.size} selected` : `Select ${pendingDocuments.length} documents`}
        </Checkbox>

        {checkedIds.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <ButtonSecondary onClick={onBulkReject}>{`Reject (${checkedIds.size})`}</ButtonSecondary>
            <ButtonPrimary onClick={onBulkApprove}>{`Approve (${checkedIds.size})`}</ButtonPrimary>
          </div>
        )}
      </div>

      {documents.map((doc) => {
        const status = STATUS_CHIP[doc.status]
        const isOpen = doc.id === openId
        const isChecked = checkedIds.has(doc.id)
        const showRowActions = isOpen && !isChecked && doc.status === 'pending'

        return (
          <div
            key={doc.id}
            onClick={() => onOpen(doc.id)}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              width: '100%',
              padding: 16,
              borderRadius: 0,
              borderBottom: `1px solid ${colorPalette.neutral.lighten1}`,
              backgroundColor: isOpen ? OPEN_ROW_BACKGROUND_COLOR : undefined,
              cursor: 'pointer',
            }}
          >
            {doc.status === 'pending' ? (
              <div onClick={(event) => { event.stopPropagation(); onToggleChecked(doc.id) }}>
                <Checkbox checked={isChecked} onChange={() => {}} />
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

            {showRowActions ? (
              <div
                onClick={(event) => event.stopPropagation()}
                style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
              >
                <ButtonSecondary onClick={() => onRowReject(doc.id)}>Reject</ButtonSecondary>
                <ButtonPrimary onClick={() => onRowApprove(doc.id)}>Approve</ButtonPrimary>
              </div>
            ) : (
              <Chip label={status.label} chipStyle={status.chipStyle} uppercase />
            )}
          </div>
        )
      })}
    </div>
  )
}
