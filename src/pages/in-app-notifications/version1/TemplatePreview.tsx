import { useState, type ReactNode } from 'react'
import { constants, Icon, iconType, Slider, Typography } from '@goat-ui/goat-ui-core'
import paragraphIcon from '../../../assets/in-app-notifications/paragraph.svg'

const { colorPalette } = constants

// The page's natural width at 100% — the design shows it at 75% (529px).
const PAGE_WIDTH = 705
const MIN_ZOOM = 10
const MAX_ZOOM = 200
const ZOOM_STEP = 25

// Figma's variable tint (#F1F7FA) is "disabled.lighten1" there, but the
// installed palette's disabled family is grey — neutral.lighten4 is the
// closest match.
const VARIABLE_BACKGROUND_COLOR = colorPalette.neutral.lighten4

const BODY_TEXT_STYLE = { fontSize: 11, lineHeight: '18px', color: colorPalette.neutral.darken3 }

/** A template variable (e.g. [startdatum]) — filled in when a document is created. */
function Variable({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        backgroundColor: VARIABLE_BACKGROUND_COLOR,
        border: `2px solid ${VARIABLE_BACKGROUND_COLOR}`,
        borderRadius: 2,
        fontSize: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          borderRadius: 4,
          backgroundColor: VARIABLE_BACKGROUND_COLOR,
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 12, height: 12 }}>
          <img src={paragraphIcon} alt="" width={5.72078} height={10.5} style={{ display: 'block' }} />
        </span>
      </span>
      <span style={{ fontSize: 12, lineHeight: '18px', fontWeight: 600, color: colorPalette.neutral.darken3 }}>{children}</span>
    </div>
  )
}

function TemplatePage() {
  return (
    <div
      style={{
        width: PAGE_WIDTH,
        flexShrink: 0,
        backgroundColor: colorPalette.white,
        border: `1px solid ${colorPalette.neutral.lighten2}`,
        boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.08)',
        padding: '41px 68px 41px 84px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <p style={{ margin: 0, fontSize: 24, lineHeight: '36px', fontWeight: 700, textAlign: 'center', color: colorPalette.neutral.darken3 }}>
        Arbeitsvertrag für geringfügig Beschäftigte
      </p>

      <div style={BODY_TEXT_STYLE}>
        <p style={{ margin: 0 }}>
          Zwischen der Firma <Variable>[Firmenname]</Variable> (im Folgenden "Arbeitgeber")
        </p>
        <p style={{ margin: 0 }}>und</p>
        <p style={{ margin: 0 }}>
          <Variable>|Herrn | Frau | Diverse||</Variable> <Variable>[Vor- und Nachname des Mitarbeitenden]</Variable>
        </p>
        <p style={{ margin: 0 }}>wird Folgendes vereinbart:</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SectionTitle>Beginn des Anstellungsverhältnisses / Probezeit / Tätigkeit / Ort / Vorbehalte</SectionTitle>
        <ol style={{ ...BODY_TEXT_STYLE, margin: 0, paddingLeft: 22 }}>
          <li>
            <Variable>|Der || Die ||</Variable> wird mit Wirkung vom <Variable>[startdatum]</Variable> als{' '}
            <Variable>[tätigkeit]</Variable> in <Variable>[ort]</Variable> auf unbestimmte Zeit eingestellt.
          </li>
          <li>
            Die ersten <Variable>[probezeit]</Variable> Monate des Arbeitsverhältnisses gelten als Probezeit.
          </li>
          <li>
            Der Aufgabenbereich umfasst insbesondere den Bereich <Variable>[Aufgabenbereich]</Variable> Die einzelnen zum
            Aufgabenbereich gehörenden Tätigkeiten ergeben sich aus der als Anlage beigefügten und zum Vertrag gehörenden
            Stellenbeschreibung.
          </li>
          <li>
            Der Arbeitgeber behält sich im Rahmen seines Direktionsrechts vor,{' '}
            <Variable>|dem Arbeitgeber || der Arbeitnehmerin ||</Variable> innerhalb des Unternehmens eine andere{' '}
            <Variable>|seiner || ihrer || ihrer ||</Variable> Vorbildung und Fähigkeiten entsprechende gleichwertige Tätigkeit
            zu übertragen. Der Vorbehalt erstreckt sich auch auf eine Beschäftigung in einem anderen Betrieb, an einem anderen
            Ort oder in einem anderen mit dem Arbeitgeber verbundenen Unternehmen. Die Interessen{' '}
            <Variable>|des Arbeitnehmers || der Arbeitnehmers | der arbeithnehmender Person</Variable> im Rahmen billigen
            Ermessens auch abweichend festgelegt werden.
          </li>
        </ol>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SectionTitle>Arbeitszeit</SectionTitle>
        <div style={BODY_TEXT_STYLE}>
          <p style={{ margin: 0 }}>
            Die regelmäßige Arbeitszeit beträgt Anzahl Wochenstunden Wochenstunden ausschließlich der Pausen. Die Arbeitszeit
            verteilt sich auf Anzahl Wochen-Arbeitstage Tage zu je Anzahl Tagesstunden Stunden, und zwar jeweils am Aufzählung
            Wochentage. Die Pausenzeiten werden wie folgt bestimmt: Pausenzeiten
          </p>
          <p style={{ margin: 0 }}>
            Verteilung, Beginn und Ende der täglichen Arbeitszeit sowie der Pausen können vom Arbeitgeber nach
            betriebsorganisatorischen Erfordernissen unter Berücksichtigung der Belange des Arbeitnehmers | der Arbeitnehmerin
            | der arbeitnehmenden Person im Rahmen billigen Ermessens festgelegt und geändert werden.
          </p>
          <p style={{ margin: 0 }}>
            Die Beschäftigung wird als geringfügige Beschäftigung im Sinne der jeweils geltenden sozialversicherungsrechtlichen
            Bestimmungen geleistet (Entgeltgeringfügigkeit). Der Umfang der vereinbarten Arbeitszeit wird durch die
            entsprechenden Bestimmungen begrenzt.
          </p>
          <p style={{ margin: 0 }}>
            Der Arbeitnehmer | Die Arbeitnehmerin | Die arbeitnehmende Person zeichnet Beginn, Ende und Dauer seiner | ihrer |
            ihrer täglichen Arbeitszeit auf und stellt die Aufzeichnungen dem Arbeitgeber spätestens am 7. Tag, der auf die
            Arbeitsleistung folgt, zur Verfügung.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TemplatePreview() {
  const [zoom, setZoom] = useState(75)

  const changeZoom = (value: number) => setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)))

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colorPalette.neutral.lighten1,
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 24, display: 'flex' }}>
        {/* `margin: auto` centres the page while still letting it scroll
            from its left edge when zoomed wider than the canvas. */}
        <div style={{ margin: '0 auto', zoom: zoom / 100 }}>
          <TemplatePage />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 16,
          height: 32,
          padding: '0 24px',
          flexShrink: 0,
          backgroundColor: colorPalette.neutral.lighten2,
        }}
      >
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => changeZoom(zoom - ZOOM_STEP)}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex' }}
        >
          {/* The installed icon set has these two glyphs swapped —
              ZoomInOutlined draws the minus, ZoomOutOutlined the plus. */}
          <Icon type={iconType.ZoomInOutlined} size={16} color="neutral-darken2" />
        </button>
        <div style={{ width: 356 }}>
          <Slider name="zoom" min={MIN_ZOOM} max={MAX_ZOOM} value={zoom} onChange={changeZoom} />
        </div>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => changeZoom(zoom + ZOOM_STEP)}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex' }}
        >
          <Icon type={iconType.ZoomOutOutlined} size={16} color="neutral-darken2" />
        </button>
        <div style={{ width: 40 }}>
          <Typography size="base-sm" color="neutral-darken3">
            {`${zoom} %`}
          </Typography>
        </div>
      </div>
    </div>
  )
}
