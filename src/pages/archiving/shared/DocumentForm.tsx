import { Chip, chipStyles, Collapsible, Icon, iconType, Input, RadioGroup, radioGroupDirection, Select, Typography } from '@goat-ui/goat-ui-core'
import { sectionCounts, type DocumentFields } from './fields'

const HEADER_FOOTER_OPTIONS = [
  { label: 'Standard header and footer', value: 'standard' },
  { label: 'No header or footer', value: 'none' },
  { label: 'Custom', value: 'custom' },
]

// Neutral while a section is untouched, green with a tick once anything is
// filled in — as in the Figma editor.
function SectionChip({ count, total }: { count: number; total: number }) {
  return count > 0 ? (
    <Chip label={`${count}/${total}`} chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.CheckCircleFilled} />
  ) : (
    <Chip label={`${count}/${total}`} chipStyle={chipStyles.ACCENT_NEUTRAL} />
  )
}

function SectionHeader({ label, count, total }: { label: string; count: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
      <Typography>{label}</Typography>
      <SectionChip count={count} total={total} />
    </div>
  )
}

interface DocumentFormProps {
  fields: DocumentFields
  onChange: (fields: DocumentFields) => void
  /** Archived or finished documents can't be edited until the user clicks Edit. */
  readOnly: boolean
}

// The editor's "Document editor" column.
export default function DocumentForm({ fields, onChange, readOnly }: DocumentFormProps) {
  const counts = sectionCounts(fields)
  const set = <K extends keyof DocumentFields>(key: K, value: DocumentFields[K]) => onChange({ ...fields, [key]: value })

  const input = (key: keyof DocumentFields, label: string, placeholder = 'Enter number') => (
    <Input
      name={key}
      label={label}
      placeholder={placeholder}
      value={fields[key] ?? ''}
      onChange={(event) => set(key, event.target.value)}
      disabled={readOnly}
    />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div>
        <Typography size="base-lg" weight="semibold">
          Document editor
        </Typography>
        <Typography color="neutral-darken2">
          Select the structure that best suits the requirements of your document and fill in the variable fields.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input name="title" label="Title" isRequired value={fields.title} onChange={(event) => set('title', event.target.value)} disabled={readOnly} />

        <Select
          name="header-and-footer"
          label="Header and footer"
          placeholder="Choose an option"
          options={HEADER_FOOTER_OPTIONS}
          value={fields.headerFooter}
          onChange={(value) => set('headerFooter', value as string)}
          helper={'Visible only "PDF preview" mode'}
          disabled={readOnly}
        />

        <RadioGroup
          name="cover-letter"
          label="Cover letter?"
          isRequired
          direction={radioGroupDirection.ROW}
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          value={fields.coverLetter ?? ''}
          onChange={(event) => set('coverLetter', event.target.value)}
          disabled={readOnly}
        />

        <RadioGroup
          name="employee-gender"
          label="Employee gender"
          isRequired
          direction={radioGroupDirection.ROW}
          options={[
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' },
            { label: 'Diverse', value: 'diverse' },
          ]}
          value={fields.gender ?? ''}
          onChange={(event) => set('gender', event.target.value)}
          disabled={readOnly}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Typography weight="semibold">Input fields</Typography>

          <Collapsible
            defaultActiveKey={['costs']}
            items={[
              {
                key: 'intro',
                header: <SectionHeader label="Intro" count={counts.intro} total={3} />,
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
                    {input('employer', 'Arbeitgeber', 'Enter text')}
                    {input('firstName', 'Vorname Arbeitnehmerin', 'Enter text')}
                    {input('lastName', 'Nachname Arbeitnehmerin', 'Enter text')}
                  </div>
                ),
              },
              {
                key: 'requested-by',
                header: <SectionHeader label="Auf wessen Wunsch erfolgt die Teilnahme an der Fortbildung?" count={counts.requestedBy} total={1} />,
                children: (
                  <div style={{ padding: 16 }}>
                    <RadioGroup
                      name="requested-by"
                      label="Teilnahme auf Wunsch"
                      options={[
                        { label: 'des Arbeitgebers', value: 'employer' },
                        { label: 'der Arbeitnehmerin', value: 'employee' },
                      ]}
                      value={fields.requestedBy ?? ''}
                      onChange={(event) => set('requestedBy', event.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                ),
              },
              {
                key: 'costs',
                header: <SectionHeader label="Lehrgangskosten" count={counts.costs} total={5} />,
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
                    {input('total', 'Total')}
                    {input('costCoverage', 'Kostenübernahme Betrag')}
                    {input('tuition', 'Unterrichtskosten Betrag')}
                    {input('continuedPay', 'Vergütungsfortzahlung')}
                    {input('travel', 'Fahrt- und Übernachtungskosten Betrag')}
                  </div>
                ),
              },
            ]}
            expandIcon={({ isActive }) => <Icon type={isActive ? iconType.ChevronDownOutlined : iconType.ChevronRightOutlined} />}
          />
        </div>
      </div>
    </div>
  )
}
