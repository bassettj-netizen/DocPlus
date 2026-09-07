import { useMemo, useState, type ReactNode } from 'react'
import {
  ButtonPrimary,
  ButtonTertiary,
  Checkbox,
  Chip,
  chipStyles,
  chipVariants,
  constants,
  PopOver,
  popOverPlacements,
  popOverTriggers,
  SearchBar,
  Typography,
} from '@goat-ui/goat-ui-core'
import { DOCUMENT_POOL, ORGANISATION_OPTIONS, POSITION_OPTIONS } from './data'

const { colorPalette } = constants
const ALL = 'All'
const POSITION_VALUES = POSITION_OPTIONS.map((option) => option.value)
const ORGANISATION_VALUES = ORGANISATION_OPTIONS.map((option) => option.value)
const CONTENT_WIDTH = 476

interface FilterChipRowProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

function FilterChipRow({ label, options, value, onChange }: FilterChipRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 180 }}>
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

interface DocumentsDropdownProps {
  selectedIds: string[]
  disabledDocumentIds: Set<string>
  onCommit: (ids: string[]) => void
  renderTrigger: (count: number) => ReactNode
}

// A self-contained document picker: owns its own open/search/filter/pending-
// selection state so each approver row (and the not-yet-added draft row) can
// have an independent dropdown without the parent tracking which one is open.
export default function DocumentsDropdown({ selectedIds, disabledDocumentIds, onCommit, renderTrigger }: DocumentsDropdownProps) {
  const [open, setOpen] = useState(false)
  const [pendingIds, setPendingIds] = useState<string[]>(selectedIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState(ALL)
  const [organisationFilter, setOrganisationFilter] = useState(ALL)

  const matchingDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return DOCUMENT_POOL.filter((doc) => {
      const matchesQuery = !query || doc.employeeName.toLowerCase().includes(query)
      const matchesPosition = positionFilter === ALL || doc.position === positionFilter
      const matchesOrganisation = organisationFilter === ALL || doc.organisation === organisationFilter
      return matchesQuery && matchesPosition && matchesOrganisation
    })
  }, [searchQuery, positionFilter, organisationFilter])

  const selectableMatchingDocuments = matchingDocuments.filter((doc) => !disabledDocumentIds.has(doc.id))
  const allMatchingSelected =
    selectableMatchingDocuments.length > 0 && selectableMatchingDocuments.every((doc) => pendingIds.includes(doc.id))
  const someMatchingSelected = selectableMatchingDocuments.some((doc) => pendingIds.includes(doc.id))

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPendingIds(selectedIds)
      setSearchQuery('')
      setPositionFilter(ALL)
      setOrganisationFilter(ALL)
    }
    setOpen(next)
  }

  const handleToggleDocument = (id: string) => {
    setPendingIds((prev) => (prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]))
  }

  const handleToggleSelectAllMatching = () => {
    const ids = selectableMatchingDocuments.map((doc) => doc.id)
    const allSelected = ids.length > 0 && ids.every((id) => pendingIds.includes(id))
    setPendingIds((prev) => (allSelected ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))))
  }

  return (
    <PopOver
      trigger={popOverTriggers.CLICK}
      placement={popOverPlacements.BOTTOM_LEFT}
      open={open}
      onOpenChange={handleOpenChange}
      maxWidth={CONTENT_WIDTH + 32}
      // A hard ceiling on the popover's total height (search + filters + list
      // + footer). Below the design system's own default of 948 this rarely
      // mattered, but a trigger near the bottom of a long, scrolled panel
      // could push the popover off both the top AND bottom of short browser
      // viewports with no way to reach the clipped part. Capping it here
      // means the design system's own inner content wrapper takes over and
      // scrolls internally as a last resort, so nothing is ever unreachable.
      maxHeight={480}
      content={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: CONTENT_WIDTH }}>
          <SearchBar placeholder="Search for document" value={searchQuery} onChange={setSearchQuery} width="expanded" />

          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <FilterChipRow label="Position:" options={POSITION_VALUES} value={positionFilter} onChange={setPositionFilter} />
            <FilterChipRow
              label="Organisation:"
              options={ORGANISATION_VALUES}
              value={organisationFilter}
              onChange={setOrganisationFilter}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'min(240px, 30vh)', overflowY: 'auto' }}>
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
                onChange={handleToggleSelectAllMatching}
                disabled={matchingDocuments.length === 0}
              >
                {`Select ${matchingDocuments.length} matching document${matchingDocuments.length === 1 ? '' : 's'}`}
              </Checkbox>
            </div>

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
                      checked={!isDisabled && pendingIds.includes(doc.id)}
                      disabled={isDisabled}
                      onChange={() => handleToggleDocument(doc.id)}
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
      }
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <ButtonTertiary onClick={() => setOpen(false)}>Cancel</ButtonTertiary>
          <ButtonPrimary
            onClick={() => {
              onCommit(pendingIds)
              setOpen(false)
            }}
          >
            Done
          </ButtonPrimary>
        </div>
      }
    >
      {renderTrigger(selectedIds.length)}
    </PopOver>
  )
}
