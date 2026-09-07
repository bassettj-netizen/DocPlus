import { ButtonPrimary, ButtonTertiary, Panel, Select, Typography } from '@goat-ui/goat-ui-core'
import { ORGANISATION_OPTIONS, POSITION_OPTIONS, type DocumentFilters } from './data'
import PanelHeader from './PanelHeader'

interface FilterDocumentsPanelProps {
  visible: boolean
  approverEmail: string
  filters: DocumentFilters
  onChangePositions: (positions: string[]) => void
  onChangeOrganisations: (organisations: string[]) => void
  onBack: () => void
  onClose: () => void
  onApply: () => void
}

export default function FilterDocumentsPanel({
  visible,
  approverEmail,
  filters,
  onChangePositions,
  onChangeOrganisations,
  onBack,
  onClose,
  onApply,
}: FilterDocumentsPanelProps) {
  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      title={<PanelHeader title="Filter documents" onBack={onBack} onClose={onClose} />}
      footer={{
        divider: true,
        content: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <ButtonTertiary onClick={onBack}>Cancel</ButtonTertiary>
            <ButtonPrimary onClick={onApply}>Apply filters</ButtonPrimary>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography size="base-sm" color="neutral-darken2">
            Recipient:
          </Typography>
          <Typography weight="semibold">{approverEmail}</Typography>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Select
            name="position"
            label="Position"
            placeholder="Select one or more options"
            multiple
            options={POSITION_OPTIONS}
            value={filters.positions}
            onChange={(value) => onChangePositions(value as string[])}
          />
          <Select
            name="organisation"
            label="Organisation"
            placeholder="Select one or more options"
            multiple
            options={ORGANISATION_OPTIONS}
            value={filters.organisations}
            onChange={(value) => onChangeOrganisations(value as string[])}
          />
        </div>
      </div>
    </Panel>
  )
}
