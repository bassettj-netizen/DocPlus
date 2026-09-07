import { ButtonGhost, ButtonPrimary, ButtonSecondary, constants, Dropdown, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'

const { colorPalette } = constants

interface DocumentEditorHeaderProps {
  title: string
  onRequestApproval: () => void
}

export default function DocumentEditorHeader({ title, onRequestApproval }: DocumentEditorHeaderProps) {
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
      <ButtonGhost>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: colorPalette.neutral.lighten5 }}>
          <Icon type={iconType.ChevronLeftOutlined} color="neutral-lighten5" size={16} />
          Back to documents
        </span>
      </ButtonGhost>

      <div style={{ flex: 1, textAlign: 'center' }}>
        <Typography as="span" weight="bold" color="neutral-lighten5">
          {title}
        </Typography>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ButtonSecondary>Save</ButtonSecondary>

        <Dropdown
          items={[
            { key: 'request-information', label: 'Request information' },
            { key: 'request-approval', label: 'Request approval', onClick: onRequestApproval },
            { key: 'request-signature', label: 'Request signature' },
            { key: 'manage-access', label: 'Manage access' },
          ]}
        >
          <ButtonSecondary rightIcon={iconType.ChevronDownOutlined}>Share</ButtonSecondary>
        </Dropdown>

        <Dropdown items={[{ key: 'download-pdf', label: 'Download as PDF' }]}>
          <ButtonPrimary rightIcon={iconType.ChevronDownOutlined}>Export</ButtonPrimary>
        </Dropdown>
      </div>
    </div>
  )
}
