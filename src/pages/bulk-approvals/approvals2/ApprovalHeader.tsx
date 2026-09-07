import { ButtonPrimary, ButtonSecondary, Typography } from '@goat-ui/goat-ui-core'
import hrdLogo from '../../../assets/hrd-product-logo.svg'

interface ApprovalHeaderProps {
  title: string
  disabled: boolean
  selectedCount: number
  onReject: () => void
  onApprove: () => void
}

export default function ApprovalHeader({ title, disabled, selectedCount, onReject, onApprove }: ApprovalHeaderProps) {
  const suffix = selectedCount > 0 ? ` (${selectedCount})` : ''
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        backgroundColor: '#2f384a',
        boxShadow: '0px 4px 4px rgba(130,138,155,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: 163 }}>
        <img src={hrdLogo} alt="HRD" width={32} height={32} />
      </div>

      <div style={{ flex: 1, textAlign: 'center' }}>
        <Typography as="span" weight="bold" color="neutral-lighten5">
          {title}
        </Typography>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ButtonSecondary disabled={disabled} onClick={onReject}>
          Reject{suffix}
        </ButtonSecondary>
        <ButtonPrimary disabled={disabled} onClick={onApprove}>
          Approve{suffix}
        </ButtonPrimary>
      </div>
    </div>
  )
}
