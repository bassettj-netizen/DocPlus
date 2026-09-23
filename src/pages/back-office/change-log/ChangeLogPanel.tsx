import { ButtonDanger, ButtonTertiary, Panel, Typography } from '@goat-ui/goat-ui-core'
import { STATUS_LABELS, STATUS_TONES, type ChangeLogEntry } from './data'
import PanelHeader from './PanelHeader'

interface ChangeLogPanelProps {
  visible: boolean
  entry: ChangeLogEntry | null
  onClose: () => void
  onCancelPublishing: () => void
}

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

// The one detail panel for every Change Log row. An "Other" reason entry
// (a manual publish/import unrelated to a legal change) has no Content Hub
// text to show, so Source and the two Change notification fields only render
// for "Legal" reason entries — matching the design's two panel lengths.
export default function ChangeLogPanel({ visible, entry, onClose, onCancelPublishing }: ChangeLogPanelProps) {
  const isLegal = entry?.changeReason === 'Legal Update'
  const canCancelPublishing = entry?.status === 'scheduled'

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      title={
        entry && (
          <PanelHeader
            title={entry.templateName}
            statusLabel={STATUS_LABELS[entry.status]}
            statusTone={STATUS_TONES[entry.status]}
            onClose={onClose}
          />
        )
      }
      footer={{
        divider: true,
        content: (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: canCancelPublishing ? 'space-between' : 'flex-end',
              width: '100%',
            }}
          >
            <ButtonTertiary onClick={onClose}>Close</ButtonTertiary>
            {canCancelPublishing && <ButtonDanger onClick={onCancelPublishing}>Cancel publishing</ButtonDanger>}
          </div>
        ),
      }}
    >
      {entry && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Original HRD template ID" value={entry.originalTemplateId} />
          <Field label="Updated template ID" value={entry.updatedTemplateId} />
          <Field label="Change Reason" value={entry.changeReason} />
          {isLegal && entry.source && <Field label="Source" value={entry.source} />}
          <Field label="Author" value={entry.author} />
          <Field label="Folder" value={entry.folder} />
          <Field label="Update date" value={entry.changeDate} />
          {isLegal && entry.legalUpdate && <Field label="Change notification" value={entry.legalUpdate} />}
          {isLegal && entry.changeNotification && (
            <Field label="Change notification" value={entry.changeNotification} />
          )}
        </div>
      )}
    </Panel>
  )
}
