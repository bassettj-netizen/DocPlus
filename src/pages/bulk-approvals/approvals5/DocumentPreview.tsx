import type { ReactNode } from 'react'
import { constants, Typography } from '@goat-ui/goat-ui-core'

const { colorPalette } = constants

// The theme's "primary" family is only resolved at runtime by ThemeProvider,
// so it isn't available as a static hex in `colorPalette` — these match the
// BLUE theme's primary.lighten3 / a pale primary tint used elsewhere in the app.
const HIGHLIGHT_BORDER_COLOR = '#ADC8FF'
const HIGHLIGHT_BACKGROUND_COLOR = '#EAF1FF'

function Highlight({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline',
        border: `1px solid ${HIGHLIGHT_BORDER_COLOR}`,
        borderRadius: 4,
        padding: '0 4px',
        backgroundColor: HIGHLIGHT_BACKGROUND_COLOR,
      }}
    >
      {children}
    </span>
  )
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

function Page1({ firstName, lastName }: { firstName: string; lastName: string }) {
  return (
    <Page>
      <Typography size="heading-md" weight="bold">
        Fortbildungsvertrag mit Rückzahlungsklausel
      </Typography>

      <Typography align="center">
        Zwischen <Highlight>Docplus</Highlight> (im Folgenden &quot;Arbeitgeber&quot;) und <Highlight>Frau</Highlight>{' '}
        <Highlight>{firstName}</Highlight> <Highlight>{lastName}</Highlight> Mitarbeitenden im Folgenden (&quot;Arbeitnehmerin
        &quot;) werden folgende Vereinbarungen getroffen:
      </Typography>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={1}>Art und Dauer der Fortbildung</SectionHeading>
        <Typography color="neutral-darken4">
          <Highlight>Die Arbeitnehmerin</Highlight> nimmt für die Zeit vom <Highlight>01/10/2024</Highlight> . bis{' '}
          <Highlight>31/10/2024</Highlight> an einem Fortbildungslehrgang für teil. Die Teilnahme erfolgt auf Wunsch
          des Arbeitgebers und dient seiner beruflichen Fort- und Weiterbildung.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={2}>Freistellung und Vergütung</SectionHeading>
        <Typography color="neutral-darken4">
          <Highlight>Die Arbeitnehmerin</Highlight> für die Dauer des Lehrgangs unter Fortzahlung der Bezüge von der
          Arbeit frei. Die zu zahlende Vergütung wird ohne tätigkeitsbezogene Zulagen und Zuschläge nach dem
          Durchschnittsverdienst der letzten 3 Monate berechnet.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={3}>Lehrgangskosten</SectionHeading>
        <Typography color="neutral-darken4">
          Die Kosten des Lehrgangs (Unterrichtskosten, Kosten der Unterbringung, Fahrtkosten) übernimmt der
          Arbeitgeber in voller Höhe/ bis zu einem Betrag von <Highlight>8000</Highlight> EUR. Die Kostenaufstellungen
          sind <Highlight>von der Arbeitnehmerin</Highlight> vorzulegen und werden nach Abschluss des Lehrgangs gegen
          Vorlage der Originalbelege erstattet. Die durch die Bildungsmaßnahmen entstehenden und ggf.
          erstattungspflichtigen Kosten werden voraussichtlich betragen:
        </Typography>

        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Typography color="neutral-darken4">
              Unterrichtskosten: <Highlight>2000</Highlight> EUR
            </Typography>
          </li>
          <li>
            <Typography color="neutral-darken4">
              Vergütungsfortzahlung inkl. Arbeitnehmeranteil Sozialversicherung: <Highlight>1200</Highlight> EUR
            </Typography>
          </li>
          <li>
            <Typography color="neutral-darken4">
              Fahrt- und Übernachtungskosten: <Highlight>200</Highlight> EUR
            </Typography>
          </li>
          <li>
            <Typography color="neutral-darken4">
              Gesamtkosten: <Highlight>400</Highlight> EUR
            </Typography>
          </li>
        </ul>

        <Typography color="neutral-darken4">
          Soweit von der Agentur für Arbeit oder einer sonstigen dritten Stelle Lehrgangskosten übernommen werden,
          besteht kein Kostenerstattungsanspruch gegen den Arbeitgeber. <Highlight>Die Arbeitnehmerin</Highlight> nach
          möglichen Kostenbeteiligungen Dritter zu erkundigen und rechtzeitig die entsprechenden Anträge zu stellen.
          Kommt <Highlight>die Arbeitnehmerin</Highlight> dieser Verpflichtung nicht nach, entfällt der
          Kostenerstattungsanspruch gegen den Arbeitgeber in Höhe der regelmäßigen Beteiligung der dritten Stelle.
        </Typography>
      </div>
    </Page>
  )
}

function Page2() {
  return (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={4}>Rückerstattung bei Ausscheiden vor Abschluss der Fortbildung bzw. bei Abbruch der Fortbildung</SectionHeading>
        <Typography color="neutral-darken4">
          Kündigt <Highlight>die Arbeitnehmerin</Highlight> vor Abschluss der Fortbildung das Arbeitsverhältnis, ohne
          dass dies auf einem vertragswidrigen Verhalten des Arbeitgebers oder auf Gründen beruht, die der
          Verantwortungs- und Risikosphäre des Arbeitgebers zuzurechnen sind, oder kündigt der Arbeitgeber im
          gleichen Zeitraum das Arbeitsverhältnis fristlos aus wichtigem Grund, den <Highlight>die Arbeitnehmerin</Highlight>{' '}
          zu vertreten hat, oder ordentlich aus verhaltensbedingten Gründen, so hat{' '}
          <Highlight>die Arbeitnehmerin</Highlight> die Kosten des Fortbildungslehrgangs und die für die Zeit der
          Freistellung gezahlte Vergütung (ohne Arbeitgeberanteile zur Sozialversicherung) zurückzuerstatten, die der
          Arbeitgeber bis zum Ausspruch der Kündigung oder bis zum Abschluss des auf Initiative{' '}
          <Highlight>der Arbeitnehmerin</Highlight> zustande gekommenen Aufhebungsvertrags tatsächlich getragen hat.
          Keine Rückzahlungsverpflichtung besteht in Fällen, in denen der Arbeitgeber kein berechtigtes Interesse an
          der Fortsetzung des Arbeitsverhältnisses hat. Ausgenommen von der Rückzahlungspflicht ist eine
          Eigenkündigung wegen einer unverschuldeten, dauerhaften Leistungsunfähigkeit, beispielsweise bei Krankheit.
          Bei Abbruch der Fortbildung aus Gründen, die <Highlight>die Arbeitnehmerin</Highlight> zu vertreten hat, ist{' '}
          <Highlight>die Arbeitnehmerin</Highlight> zur Rückzahlung der bis zum Abbruch tatsächlich entstandenen
          Kosten einschließlich der für die Zeit der Freistellung gezahlten Vergütung (ohne Arbeitgeberanteile zur
          Sozialversicherung) verpflichtet.
        </Typography>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionHeading number={5}>Abtretung</SectionHeading>
        <Typography color="neutral-darken4">
          Zur Sicherung des Rückforderungsanspruchs tritt <Highlight>die Arbeitnehmerin</Highlight> an den
          Arbeitgeber bis zur Höhe der Forderung den pfändbaren Teil ihrer Vergütungsansprüche gegen sämtliche
          Arbeitgeber ab, bei denen <Highlight>sie</Highlight> nach Beendigung des Studiums bzw. Ausscheiden bei dem
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

interface DocumentPreviewProps {
  employeeName: string
}

export default function DocumentPreview({ employeeName }: DocumentPreviewProps) {
  const lastSpace = employeeName.lastIndexOf(' ')
  const firstName = lastSpace === -1 ? employeeName : employeeName.slice(0, lastSpace)
  const lastName = lastSpace === -1 ? '' : employeeName.slice(lastSpace + 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <Page1 firstName={firstName} lastName={lastName} />
      <Page2 />
    </div>
  )
}
