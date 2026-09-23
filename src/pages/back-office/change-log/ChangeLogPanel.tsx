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

// The one detail panel for every Change Log row. A "Manually created" reason
// entry (a manual publish/import unrelated to a legal change) has no Content
// Hub text to show, so Source only renders for "Legal change" reason entries
// — and the two notification sections additionally require "Send
// Notification" to have been checked, since otherwise no notification was
// ever sent.
export default function ChangeLogPanel({ visible, entry, onClose, onCancelPublishing }: ChangeLogPanelProps) {
  const isLegal = entry?.changeReason === 'Legal change'
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
          <Field label="Change date" value={entry.changeDate} />
          {/* Both sections describe a notification that went out to users — if
              "Send Notification" was never checked, no notification exists to
              show details for, so neither renders. */}
          {isLegal && entry.sendNotification && entry.legalUpdate && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Typography as="span" weight="semibold">
                Change notification
              </Typography>
              <Typography as="span" size="base-sm">
                <Typography as="span" size="base-sm" weight="bold">
                  Content Hub:{' '}
                </Typography>
                {entry.legalUpdate}
              </Typography>
            </div>
          )}
          {isLegal && entry.sendNotification && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Typography as="span" weight="semibold">
                Notification to users
              </Typography>
              <Typography as="span" size="base-sm">
                {entry.changeNotification}
              </Typography>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
