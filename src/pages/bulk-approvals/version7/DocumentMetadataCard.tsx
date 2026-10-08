import { useState } from 'react'
import {
  Chip,
  chipStyles,
  Collapsible,
  constants,
  Icon,
  iconType,
  Input,
  RadioGroup,
  Select,
  Typography,
} from '@goat-ui/goat-ui-core'

const { colorPalette } = constants

const HEADER_FOOTER_OPTIONS = [
  { label: 'Standard header and footer', value: 'standard' },
  { label: 'No header or footer', value: 'none' },
  { label: 'Custom', value: 'custom' },
]

function SectionChip({ label, complete }: { label: string; complete: boolean }) {
  return complete ? (
    <Chip label={label} chipStyle={chipStyles.SEMANTIC_SUCCESS} leftIcon={iconType.CheckCircleOutlined} uppercase />
  ) : (
    <Chip label={label} chipStyle={chipStyles.ACCENT_NEUTRAL} uppercase />
  )
}

export default function DocumentMetadataCard() {
  const [headerFooter, setHeaderFooter] = useState<string>()
  const [coverLetter, setCoverLetter] = useState('no')
  const [gender, setGender] = useState('female')

  return (
    <div
      style={{
        backgroundColor: colorPalette.white,
        border: `1px solid ${colorPalette.neutral.lighten2}`,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div>
        <Typography size="base-lg" weight="semibold">
          Document editor
        </Typography>
        <Typography color="neutral-darken2">
          Select the structure that best suits the requirements of your document and fill in the variable fields.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input name="title" label="Title" isRequired defaultValue="Fortbildungsvertrag mit Rückzahlungsklausel" />

        <Select
          name="header-and-footer"
          label="Header and footer"
          placeholder="Choose an option"
          options={HEADER_FOOTER_OPTIONS}
          value={headerFooter}
          onChange={(value) => setHeaderFooter(value as string)}
          helper={'Visible only "PDF preview" mode'}
        />

        <RadioGroup
          name="cover-letter"
          label="Cover letter?"
          isRequired
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]}
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
        />

        <RadioGroup
          name="employee-gender"
          label="Employee gender"
          isRequired
          options={[
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' },
            { label: 'Diverse', value: 'diverse' },
          ]}
          value={gender}
          onChange={(event) => setGender(event.target.value)}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Typography weight="semibold">Input fields</Typography>

          <Collapsible
            defaultActiveKey={['costs']}
            items={[
              {
                key: 'intro',
                header: (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Intro</Typography>
                    <SectionChip label="3/3" complete />
                  </div>
                ),
              },
              {
                key: 'purpose',
                header: (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
                    <Typography>Auf wessen Wunsch erfolgt die Teilnahme an der Fortbildung?</Typography>
                    <SectionChip label="Frage" complete />
                  </div>
                ),
              },
              {
                key: 'costs',
                header: (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Lehrgangskosten</Typography>
                    <SectionChip label="1/5" complete={false} />
                  </div>
                ),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
                    <Input name="total" label="Total" defaultValue="8000" />
                    <Input name="kostenuebernahme" label="Kostenübernahme Betrag" defaultValue="2000" />
                    <Input name="unterrichtskosten" label="Unterrichtskosten Betrag" defaultValue="1200" />
                    <Input name="verguetungsfortzahlung" label="Vergütungsfortzahlung" defaultValue="200" />
                    <Input name="fahrtkosten" label="Fahrt- und Übernachtungskosten Betrag" placeholder="Insert value" />
                    <Input name="gesamtkosten" label="Gesamtkosten Betrag" defaultValue="4500" />
                  </div>
                ),
              },
            ]}
            expandIcon={({ isActive }) => (
              <Icon type={isActive ? iconType.ChevronDownOutlined : iconType.ChevronRightOutlined} />
            )}
          />
        </div>
      </div>
    </div>
  )
}
