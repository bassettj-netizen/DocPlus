import { ButtonGhost, Chip, chipStyles, constants, iconType } from '@goat-ui/goat-ui-core'
import type { ApprovalStatus } from './data'

const { colorPalette } = constants

interface DecisionBannerProps {
  status: Exclude<ApprovalStatus, 'pending'>
  onUndo: () => void
}

export default function DecisionBanner({ status, onUndo }: DecisionBannerProps) {
  const isApproved = status === 'approved'

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        width: '100%',
        backgroundColor: isApproved ? colorPalette.success.lighten5 : colorPalette.danger.lighten5,
      }}
    >
      <Chip
        label={isApproved ? 'Approved' : 'Rejected'}
        chipStyle={isApproved ? chipStyles.SEMANTIC_SUCCESS : chipStyles.SEMANTIC_DANGER}
        leftIcon={isApproved ? iconType.CheckCircleFilled : iconType.CrossFilled}
        uppercase
      />
      <ButtonGhost onClick={onUndo}>Undo</ButtonGhost>
    </div>
  )
}
