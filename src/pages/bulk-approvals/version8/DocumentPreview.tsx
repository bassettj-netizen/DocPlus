import type { ReactNode } from 'react'
import { constants, Typography } from '@goat-ui/goat-ui-core'
import { FROM, GENITIVE, NOMINATIVE, nominative, PRONOUN, TERM, type GenderForms } from '../../archiving/shared/genderForms'
import { Choice, Gendered, Input } from '../../archiving/shared/PreviewFields'

const { colorPalette } = constants

// Field styling as in Send via email (the shared Archiving preview): input
// fields orange, gender-dependent wording cyan — a placeholder on that colour
// until filled, then the value in an outline. The values are the ones the
// form beside it starts with; the wording follows its Employee gender.
const VALUES = {
  employer: 'Docplus',
  firstName: 'Giulia',
  lastName: 'Schmitt',
  total: '8000',
  tuition: '1200',
  continuedPay: '200',
  travel: '',
  overall: '4500',
}

function SectionHeading({ number, children }: { number: number; children: ReactNode }) {
  return (
    <Typography weight="semibold">
      <>
        §{number} {children}
      </>
    </Typography>
  )
}

function Page({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 794,
        backgroundColor: colorPalette.white,
        border: `1px solid ${colorPalette.neutral.lighten2}`,
        boxShadow: '0 1px 4px rgba(28, 33, 45, 0.08)',
        padding: '48px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {children}
    </div>
  )
}

function Page1({ gender }: { gender?: string }) {
  const g = (forms: GenderForms) => <Gendered gender={gender} forms={forms} />
  return (
    <Page>
      <Typography size="heading-md" weight="bold">
        Fortbildungsvertrag mit Rückzahlungsklausel
      </Typography>

      <Typography align="center">
        Zwischen <Input value={VALUES.employer} label="Arbeitgeber" /> (im Folgenden &quot;Arbeitgeber&quot;) und{' '}
        {gender !== 'diverse' && (
          <>
            <Choice options={['Herr', 'Frau']} chosen={gender === 'male' ? 'Herr' : gender === 'female' ? 'Frau' : undefined} />{' '}
          </>
        )}
        <Input value={VALUES.firstName} label="Vorname Arbeitnehmerin" /> <Input value={VALUES.lastName} label="Nachname Arbeitnehmerin" />{' '}
        Mitarbeitenden im Folgenden (&quot;{g(TERM)}&quot;) werden folgende Vereinbarungen getroffen:
      </Typography>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={1}>Art und Dauer der Fortbildung</SectionHeading>
        <Typography color="neutral-darken4">
          {g(NOMINATIVE)} nimmt für die Zeit vom 01/10/2024 bis 31/10/2024 an einem Fortbildungslehrgang teil. Die
          Teilnahme erfolgt auf Wunsch <Choice options={['des Arbeitgebers', GENITIVE.female]} chosen="des Arbeitgebers" /> und
          dient der beruflichen Fort- und Weiterbildung.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={2}>Freistellung und Vergütung</SectionHeading>
        <Typography color="neutral-darken4">
          {g(NOMINATIVE)} wird für die Dauer des Lehrgangs unter Fortzahlung der Bezüge von der
          Arbeit frei. Die zu zahlende Vergütung wird ohne tätigkeitsbezogene Zulagen und Zuschläge nach dem
          Durchschnittsverdienst der letzten 3 Monate berechnet.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={3}>Lehrgangskosten</SectionHeading>
        <Typography color="neutral-darken4">
          Die Kosten des Lehrgangs (Unterrichtskosten, Kosten der Unterbringung, Fahrtkosten) übernimmt der
          Arbeitgeber in voller Höhe/ bis zu einem Betrag von <Input value={VALUES.total} label="Total" /> EUR. Die
          Kostenaufstellungen sind {g(FROM)} vorzulegen und werden nach Abschluss des Lehrgangs gegen
          Vorlage der Originalbelege erstattet. Die durch die Bildungsmaßnahmen entstehenden und ggf.
          erstattungspflichtigen Kosten werden voraussichtlich betragen:
        </Typography>

        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Typography color="neutral-darken4">
              Unterrichtskosten: <Input value={VALUES.tuition} label="Unterrichtskosten Betrag" /> EUR
            </Typography>
          </li>
          <li>
            <Typography color="neutral-darken4">
              Vergütungsfortzahlung inkl. Arbeitnehmeranteil Sozialversicherung: <Input value={VALUES.continuedPay} label="Vergütungsfortzahlung" /> EUR
            </Typography>
          </li>
          <li>
            <Typography color="neutral-darken4">
              Fahrt- und Übernachtungskosten: <Input value={VALUES.travel} label="Fahrt- und Übernachtungskosten Betrag" /> EUR
            </Typography>
          </li>
          <li>
            <Typography color="neutral-darken4">
              Gesamtkosten: <Input value={VALUES.overall} label="Gesamtkosten Betrag" /> EUR
            </Typography>
          </li>
        </ul>

        <Typography color="neutral-darken4">
          Soweit von der Agentur für Arbeit oder einer sonstigen dritten Stelle Lehrgangskosten übernommen werden,
          besteht kein Kostenerstattungsanspruch gegen den Arbeitgeber. {g(NOMINATIVE)} ist verpflichtet, sich nach
          möglichen Kostenbeteiligungen Dritter zu erkundigen und rechtzeitig die entsprechenden Anträge zu stellen.
          Kommt {g(nominative)} dieser Verpflichtung nicht nach, entfällt der
          Kostenerstattungsanspruch gegen den Arbeitgeber in Höhe der regelmäßigen Beteiligung der dritten Stelle.
        </Typography>
      </div>
    </Page>
  )
}

function Page2({ gender }: { gender?: string }) {
  const g = (forms: GenderForms) => <Gendered gender={gender} forms={forms} />
  return (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={4}>Rückerstattung bei Ausscheiden vor Abschluss der Fortbildung bzw. bei Abbruch der Fortbildung</SectionHeading>
        <Typography color="neutral-darken4">
          Kündigt {g(nominative)} vor Abschluss der Fortbildung das Arbeitsverhältnis, ohne
          dass dies auf einem vertragswidrigen Verhalten des Arbeitgebers oder auf Gründen beruht, die der
          Verantwortungs- und Risikosphäre des Arbeitgebers zuzurechnen sind, oder kündigt der Arbeitgeber im
          gleichen Zeitraum das Arbeitsverhältnis fristlos aus wichtigem Grund, den {g(nominative)}{' '}
          zu vertreten hat, oder ordentlich aus verhaltensbedingten Gründen, so hat{' '}
          {g(nominative)} die Kosten des Fortbildungslehrgangs und die für die Zeit der
          Freistellung gezahlte Vergütung (ohne Arbeitgeberanteile zur Sozialversicherung) zurückzuerstatten, die der
          Arbeitgeber bis zum Ausspruch der Kündigung oder bis zum Abschluss des auf Initiative{' '}
          {g(GENITIVE)} zustande gekommenen Aufhebungsvertrags tatsächlich getragen hat.
          Keine Rückzahlungsverpflichtung besteht in Fällen, in denen der Arbeitgeber kein berechtigtes Interesse an
          der Fortsetzung des Arbeitsverhältnisses hat. Ausgenommen von der Rückzahlungspflicht ist eine
          Eigenkündigung wegen einer unverschuldeten, dauerhaften Leistungsunfähigkeit, beispielsweise bei Krankheit.
          Bei Abbruch der Fortbildung aus Gründen, die {g(nominative)} zu vertreten hat, ist{' '}
          {g(nominative)} zur Rückzahlung der bis zum Abbruch tatsächlich entstandenen
          Kosten einschließlich der für die Zeit der Freistellung gezahlten Vergütung (ohne Arbeitgeberanteile zur
          Sozialversicherung) verpflichtet.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={5}>Abtretung</SectionHeading>
        <Typography color="neutral-darken4">
          Zur Sicherung des Rückforderungsanspruchs tritt {g(nominative)} an den
          Arbeitgeber bis zur Höhe der Forderung den pfändbaren Teil ihrer Vergütungsansprüche gegen sämtliche
          Arbeitgeber ab, bei denen {g(PRONOUN)} nach Beendigung des Studiums bzw. Ausscheiden bei dem
          Arbeitgeber tätig sein wird. Der Arbeitgeber nimmt die Abtretung hiermit an.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={6}>Schlussbestimmungen / Nebenabreden / Schriftform</SectionHeading>
        <Typography color="neutral-darken4">
          Mündliche Nebenabreden bestehen nicht. Ergänzungen und Änderungen dieses Vertrags bedürfen zu ihrer
          Rechtswirksamkeit der Schriftform. Dies gilt nicht für individuelle Vertragsabreden i. S. v. § 305b BGB mit
          einem vertretungsbefugten Vertreter des Arbeitgebers. Im Übrigen kann das Formerfordernis nicht durch
          mündliche Vereinbarung, konkludentes Verhalten oder stillschweigend außer Kraft gesetzt werden. Sollte eine
          Bestimmung dieser Vereinbarung unwirksam sein oder werden, wird die Wirksamkeit der übrigen Bestimmungen
          hiervon nicht berührt. Die Parteien verpflichten sich, die unwirksame Bestimmung durch eine Vereinbarung zu
          ersetzen, die der unwirksamen Bestimmung in Interessenlage und Bedeutung möglichst nahe kommt.
          Entsprechendes gilt für den Fall, dass die Regelungen dieses Vertrags eine von den Vertragsparteien nicht
          beabsichtigte Lücke aufweisen.
        </Typography>
      </div>

      <div style={{ whiteSpace: 'pre-line', marginTop: 16 }}>
        <Typography color="neutral-darken2">
          {'________________                       ________________\nOrt, Datum                                     Ort, Datum\n________________                       ________________\nArbeitgeber                                    Arbeitnehmer | Arbeitnehmerin | Arbeitnehmende Person'}
        </Typography>
      </div>
    </Page>
  )
}

export default function DocumentPreview({ gender }: { gender?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <Page1 gender={gender} />
      <Page2 gender={gender} />
    </div>
  )
}
