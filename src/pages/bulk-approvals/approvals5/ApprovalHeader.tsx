import { Typography } from '@goat-ui/goat-ui-core'
import hrdLogo from '../../../assets/hrd-product-logo.svg'

interface ApprovalHeaderProps {
  title: string
}

// No Reject/Approve here anymore — a single open, unchecked document is
// decided from its own row in the list (see ApprovalListPanel); a checked
// batch is decided from the list's own bulk bar. The header is just
// branding + context now.
export default function ApprovalHeader({ title }: ApprovalHeaderProps) {
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

      <div style={{ width: 163 }} />
    </div>
  )
}
