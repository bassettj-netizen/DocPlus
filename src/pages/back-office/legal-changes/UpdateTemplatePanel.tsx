import { useState } from 'react'
import {
  ButtonPrimary,
  ButtonTertiary,
  Checkbox,
  DatePicker,
  Icon,
  iconType,
  Input,
  Panel,
  Select,
  TextArea,
  Typography,
} from '@goat-ui/goat-ui-core'
import { FOLDER_OPTIONS, type LegalChange } from './data'
import PanelHeader from './PanelHeader'

export interface UpdateDraft {
  updatedTemplateId: string
  author: string
  folder: string
  updateDate: Date | undefined
  sendNotification: boolean
  /** The reviewer's own message, shown to HR Dokumente users — only sent when `sendNotification` is checked. */
  notificationText: string
}

interface UpdateTemplatePanelProps {
  visible: boolean
  change: LegalChange | null
  draft: UpdateDraft
  onDraftChange: (draft: UpdateDraft) => void
  onClose: () => void
  onSave: () => void
}

// The design puts a small info line under the date field and the checkbox
// rather than using the inputs' own `helper`, because the checkbox has none.
function HelperLine({ children }: { children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
      <Icon type={iconType.InfoCircleOutlined} size={16} color="neutral-darken2" />
      <Typography as="span" size="base-sm" color="neutral-darken2">
        {children}
      </Typography>
    </div>
  )
}

export default function UpdateTemplatePanel({
  visible,
  change,
  draft,
  onDraftChange,
  onClose,
  onSave,
}: UpdateTemplatePanelProps) {
  const update = (patch: Partial<UpdateDraft>) => onDraftChange({ ...draft, ...patch })

  const [showTemplateIdError, setShowTemplateIdError] = useState(false)

  // Reset validation state each time the panel opens for a (possibly
  // different) change, rather than carrying a stale error into a fresh
  // session — adjusted during render rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  const [wasVisible, setWasVisible] = useState(visible)
  if (visible !== wasVisible) {
    setWasVisible(visible)
    if (visible) setShowTemplateIdError(false)
  }

  const handleSave = () => {
    if (!draft.updatedTemplateId.trim()) {
      setShowTemplateIdError(true)
      return
    }
    setShowTemplateIdError(false)
    onSave()
  }

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <ButtonTertiary onClick={onClose}>Cancel</ButtonTertiary>
            <ButtonPrimary onClick={handleSave}>Save</ButtonPrimary>
          </div>
        ),
      }}
    >
      {change && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            name="original-template-id"
            label="Original HRD template ID"
            value={change.originalTemplateId}
            readOnly
          />

          <Input
            name="updated-template-id"
            label="Updated HRD template ID"
            placeholder="Insert text"
            value={draft.updatedTemplateId}
            onChange={(event) => {
              update({ updatedTemplateId: event.target.value })
              if (event.target.value.trim()) setShowTemplateIdError(false)
            }}
            isRequired
            error={showTemplateIdError ? 'Enter an updated HRD template ID.' : undefined}
          />

          <Input
            name="author"
            label="Author"
            placeholder="Insert text"
            value={draft.author}
            onChange={(event) => update({ author: event.target.value })}
          />

          <Select
            name="folder"
            label="Folder"
            placeholder="Select Folder"
            options={FOLDER_OPTIONS.map((folder) => ({ label: folder, value: folder }))}
            value={draft.folder || undefined}
            onChange={(value) => update({ folder: value as string })}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <DatePicker
              name="update-date"
              label="Publish date"
              placeholder="DD/MM/YYYY"
              value={draft.updateDate}
              onChange={(date) => update({ updateDate: date ?? undefined })}
            />
            <HelperLine>
              The publish date corresponds to the day the template will appear on HR Dokumente.
            </HelperLine>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography as="span" weight="semibold">
              Inform HRD users
            </Typography>
            <Checkbox
              checked={draft.sendNotification}
              onChange={(event) => update({ sendNotification: event.target.checked })}
            >
              Send Notification
            </Checkbox>
            <HelperLine>By checking this box the legal update is sent to HR Dokumente Users</HelperLine>
          </div>

          {draft.sendNotification && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Typography as="span" weight="semibold">
                Change notification
              </Typography>
              {/* TextArea's own `description` slot only accepts a plain string
                  in this DS version, which can't bold just the "Content Hub:"
                  prefix — so the preview is rendered here instead, matching
                  the design exactly, and the field below is unlabeled. */}
              <Typography as="span" size="base-sm">
                <Typography as="span" size="base-sm" weight="bold">
                  Content Hub:{' '}
                </Typography>
                {change.legalUpdate}
              </Typography>
              <TextArea
                name="change-notification"
                placeholder="Insert notification text"
                value={draft.notificationText}
                onChange={(event) => update({ notificationText: event.target.value })}
              />
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
