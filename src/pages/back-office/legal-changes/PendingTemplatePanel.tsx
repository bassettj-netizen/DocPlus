import { ButtonPrimary, ButtonSecondary, ButtonTertiary, Panel, Typography } from '@goat-ui/goat-ui-core'
import type { LegalChange } from './data'
import PanelHeader from './PanelHeader'

interface PendingTemplatePanelProps {
  visible: boolean
  change: LegalChange | null
  onClose: () => void
  onDiscard: () => void
  onStartUpdate: () => void
}

/** One label + value pair of the read-only property list. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography as="span" size="base-sm" color="neutral-darken2">
        {label}
      </Typography>
      <Typography as="span">{value}</Typography>
    </div>
  )
}

// The pending-review panel behind a row in the Pending list: it shows what
// Content Hub delivered, and offers the two review decisions. The panel's own
// title is the template's name (matching the design) — not a generic label —
// so the body never repeats it as a field.
export default function PendingTemplatePanel({
  visible,
  change,
  onClose,
  onDiscard,
  onStartUpdate,
}: PendingTemplatePanelProps) {
  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      title={change && <PanelHeader title={change.templateName} onClose={onClose} />}
      footer={{
        divider: true,
        content: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <ButtonTertiary onClick={onClose}>Cancel</ButtonTertiary>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ButtonSecondary onClick={onDiscard}>Discard changes</ButtonSecondary>
              <ButtonPrimary onClick={onStartUpdate}>Update template</ButtonPrimary>
            </div>
          </div>
        ),
      }}
    >
      {change && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography as="span" size="base-sm" color="neutral-darken2">
              Content hub
            </Typography>
            <Typography>{change.legalUpdate}</Typography>
          </div>

          <Field label="Date  (Content hub)" value={change.contentHubDate} />
          <Field label="Template ID" value={change.haufeIndex} />
          <Field label="Author" value={change.author} />
          <Field label="Folder" value={change.folder} />
          <Field label="Source" value={change.source} />
        </div>
      )}
    </Panel>
  )
}
