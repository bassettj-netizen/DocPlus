import {
  ButtonPrimary,
  ButtonTertiary,
  Checkbox,
  Chip,
  chipStyles,
  chipVariants,
  constants,
  Panel,
  SearchBar,
  Typography,
} from '@goat-ui/goat-ui-core'
import type { DocumentRecord } from './data'
import PanelHeader from './PanelHeader'

const { colorPalette } = constants

const ALL = 'All'

interface FilterChipRowProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

function FilterChipRow({ label, options, value, onChange }: FilterChipRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 200 }}>
      <Typography size="base-sm" color="neutral-darken2">
        {label}
      </Typography>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[ALL, ...options].map((option) => (
          <Chip
            key={option}
            label={option}
            uppercase
            chipStyle={chipStyles.ACCENT_NEUTRAL}
            variant={option === value ? chipVariants.HIGHLIGHT : chipVariants.SUBTLE}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  )
}

interface AssignDocumentsPanelProps {
  visible: boolean
  approverEmail: string
  searchQuery: string
  onSearchChange: (value: string) => void
  positionOptions: string[]
  organisationOptions: string[]
  positionFilter: string
  organisationFilter: string
  onChangePositionFilter: (value: string) => void
  onChangeOrganisationFilter: (value: string) => void
  matchingDocuments: DocumentRecord[]
  disabledDocumentIds: Set<string>
  totalDocumentCount: number
  selectedIds: string[]
  onToggleDocument: (id: string) => void
  onToggleSelectAllMatching: () => void
  onBack: () => void
  onClose: () => void
  onDone: () => void
}

export default function AssignDocumentsPanel({
  visible,
  approverEmail,
  searchQuery,
  onSearchChange,
  positionOptions,
  organisationOptions,
  positionFilter,
  organisationFilter,
  onChangePositionFilter,
  onChangeOrganisationFilter,
  matchingDocuments,
  disabledDocumentIds,
  totalDocumentCount,
  selectedIds,
  onToggleDocument,
  onToggleSelectAllMatching,
  onBack,
  onClose,
  onDone,
}: AssignDocumentsPanelProps) {
  const selectableMatchingDocuments = matchingDocuments.filter((doc) => !disabledDocumentIds.has(doc.id))
  const allMatchingSelected =
    selectableMatchingDocuments.length > 0 && selectableMatchingDocuments.every((doc) => selectedIds.includes(doc.id))
  const someMatchingSelected = selectableMatchingDocuments.some((doc) => selectedIds.includes(doc.id))

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      title={<PanelHeader title="Assign documents" onBack={onBack} onClose={onClose} />}
      footer={{
        divider: true,
        content: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <ButtonTertiary onClick={onBack}>Cancel</ButtonTertiary>
            <ButtonPrimary onClick={onDone}>Assign</ButtonPrimary>
          </div>
        ),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 8px', height: '100%', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography size="base-sm" color="neutral-darken2">
            Recipient:
          </Typography>
          <Typography weight="semibold">{approverEmail}</Typography>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, flex: 1 }}>
          <SearchBar placeholder="Search for document" value={searchQuery} onChange={onSearchChange} width="expanded" />

          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <FilterChipRow label="Position:" options={positionOptions} value={positionFilter} onChange={onChangePositionFilter} />
            <FilterChipRow
              label="Organisation:"
              options={organisationOptions}
              value={organisationFilter}
              onChange={onChangeOrganisationFilter}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
            <div
              style={{
                borderTop: `1px solid ${colorPalette.neutral.lighten2}`,
                borderBottom: `1px solid ${colorPalette.neutral.lighten2}`,
                padding: '8px 4px',
              }}
            >
              <Checkbox
                checked={allMatchingSelected}
                indeterminate={!allMatchingSelected && someMatchingSelected}
                onChange={onToggleSelectAllMatching}
                disabled={matchingDocuments.length === 0}
              >
                {`Select ${matchingDocuments.length} matching document${matchingDocuments.length === 1 ? '' : 's'}`}
              </Checkbox>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {matchingDocuments.length === 0 ? (
                <div style={{ padding: '16px 4px' }}>
                  <Typography color="neutral-darken2">No documents match your search.</Typography>
                </div>
              ) : (
                matchingDocuments.map((doc) => {
                  const isDisabled = disabledDocumentIds.has(doc.id)
                  return (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 4px',
                        borderBottom: `1px solid ${colorPalette.neutral.lighten2}`,
                        backgroundColor: isDisabled ? colorPalette.disabled.lighten5 : undefined,
                      }}
                    >
                      <Checkbox
                        checked={!isDisabled && selectedIds.includes(doc.id)}
                        disabled={isDisabled}
                        onChange={() => onToggleDocument(doc.id)}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography weight="semibold" color={isDisabled ? 'disabled-base' : undefined}>
                            {doc.employeeName}
                          </Typography>
                          <Typography size="base-sm" color={isDisabled ? 'disabled-base' : 'neutral-darken2'}>
                            {isDisabled ? 'Already assigned to another approver' : `${doc.position} • ${doc.organisation}`}
                          </Typography>
                        </div>
                      </Checkbox>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <Typography size="base-sm" color="neutral-darken2">
            {selectedIds.length} of {totalDocumentCount} documents selected
          </Typography>
        </div>
      </div>
    </Panel>
  )
}
