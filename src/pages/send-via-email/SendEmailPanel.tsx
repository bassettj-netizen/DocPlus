import { useState } from 'react'
import {
  ButtonDashed,
  ButtonGhost,
  ButtonPrimary,
  ButtonSecondary,
  Chip,
  chipStyles,
  Collapsible,
  Icon,
  iconType,
  Input,
  Panel,
  ProgressIndicator,
  TextArea,
  Typography,
} from '@goat-ui/goat-ui-core'
import { employeeEmail, type Employee } from '../archiving/shared/data'
import { ChoiceCard } from '../archiving/version13/ExportPanel'
import { FileDocxIcon, FilePdfIcon } from './FileIcons'

export type Receiver = 'employee' | 'others'
export type EmailFormat = 'docx' | 'pdf'

export interface SendRequest {
  receiver: Receiver
  addresses: string[]
  message: string
  format: EmailFormat
}

interface SendEmailPanelProps {
  visible: boolean
  /** The document's employee; undefined when it has none ("When no employee is selected"), which skips the Receiver step. */
  employee?: Employee
  onSend: (request: SendRequest) => void
  onClose: () => void
}

type Step = 'receiver' | 'email' | 'files'
const STEP_TITLES: Record<Step, string> = { receiver: 'Receiver', email: 'Email', files: 'Files' }

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

// The Figma "Send via email" side panel (Document editor › send via email).
// Receiver — the document's employee, or other users — then Email: the
// employee's address, prefilled, or one or more addresses ("Add another"),
// with an optional message. Then Files: .docx or .PDF, and Send. A document
// without an employee goes straight to the other-users Email step: Email,
// then Files.
export default function SendEmailPanel({ visible, employee, onSend, onClose }: SendEmailPanelProps) {
  const steps: Step[] = employee ? ['receiver', 'email', 'files'] : ['email', 'files']
  const [current, setCurrent] = useState(0)
  const [receiver, setReceiver] = useState<Receiver>(employee ? 'employee' : 'others')
  const [employeeAddress, setEmployeeAddress] = useState(employee ? employeeEmail(employee) : '')
  const [addresses, setAddresses] = useState<string[]>([''])
  const [message, setMessage] = useState('')
  const [format, setFormat] = useState<EmailFormat>('pdf')

  const step = steps[current]
  const toEmployee = receiver === 'employee'
  const recipients = toEmployee ? [employeeAddress] : addresses
  const filled = addresses.filter((a) => isEmail(a)).length
  const emailsValid = recipients.length > 0 && recipients.every(isEmail)
  const canContinue = step !== 'email' || emailsValid

  const setAddress = (index: number, value: string) => setAddresses(addresses.map((a, i) => (i === index ? value : a)))
  const emailError = (value: string) => (value.trim() && !isEmail(value) ? 'Enter a valid email address' : undefined)

  const next = () => {
    if (step === 'files') {
      onSend({ receiver, addresses: recipients.map((a) => a.trim()), message, format })
      return
    }
    setCurrent(current + 1)
  }

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      width={556}
      closable={false}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
          <span style={{ display: 'inline-block', flex: 1 }}>
            <Typography as="span" size="heading-lg" weight="semibold">
              Send via email
            </Typography>
          </span>
          <ButtonGhost onClick={onClose} ariaLabel="Close">
            <Icon type={iconType.CrossOutlined} />
          </ButtonGhost>
        </span>
      }
      footer={{
        divider: true,
        content: (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
            <ButtonSecondary onClick={onClose}>Cancel</ButtonSecondary>
            <ButtonPrimary disabled={!canContinue} onClick={next}>
              {step === 'files' ? 'Send' : 'Continue'}
            </ButtonPrimary>
          </div>
        ),
      }}
    >
      {/* Spacing as in the Figma panel: 12px between the steps and each block below them (the steps row is 36px tall). */}
      <div className="send-email-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {/* Completed steps can be clicked to go back to them; later ones can't be skipped to. */}
        <div style={{ minHeight: 36 }}>
          <ProgressIndicator items={steps.map((s, i) => ({ title: STEP_TITLES[s], uppercase: false, disabled: i > current }))} current={current} onChange={(i) => i < current && setCurrent(i)} />
        </div>

        {step === 'receiver' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ChoiceCard
              name="send-receiver"
              tinted
              checked={toEmployee}
              onSelect={() => setReceiver('employee')}
              icon={iconType.UserCircleOutlined}
              title="Employee"
              description="Selected employee will receive a PDF file of their own document"
            />
            <ChoiceCard
              name="send-receiver"
              tinted
              checked={!toEmployee}
              onSelect={() => setReceiver('others')}
              icon={iconType.UsersOutlined}
              title="Other users"
              description="Send document(s) to whom might be of interest. You can send multiple documents"
            />
          </div>
        )}

        {step === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {toEmployee ? (
              <Input name="send-email-employee" label="Email" value={employeeAddress} onChange={(event) => setEmployeeAddress(event.target.value)} error={emailError(employeeAddress)} />
            ) : (
              <Collapsible
                defaultActiveKey={['addresses']}
                items={[
                  {
                    key: 'addresses',
                    header: (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
                        <Typography>Email address</Typography>
                        <Chip label={`${filled}/${addresses.length}`} chipStyle={filled === addresses.length ? chipStyles.SEMANTIC_SUCCESS : chipStyles.ACCENT_NEUTRAL} leftIcon={filled === addresses.length ? iconType.CheckCircleFilled : undefined} />
                      </div>
                    ),
                    children: (
                      // The Collapsible already pads its content 16px, as the Figma does; 8px between the fields and Add another.
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {addresses.map((address, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <Input
                                name={`send-email-${index}`}
                                label="Email"
                                isRequired
                                placeholder="Insert text"
                                value={address}
                                onChange={(event) => setAddress(index, event.target.value)}
                                error={emailError(address)}
                              />
                            </div>
                            {/* The first address stays; the ones added after it can be removed. */}
                            {index > 0 && (
                              <div style={{ paddingTop: 24 }}>
                                <ButtonGhost ariaLabel="Remove email address" onClick={() => setAddresses(addresses.filter((_, i) => i !== index))}>
                                  <Icon type={iconType.TrashOutlined} />
                                </ButtonGhost>
                              </div>
                            )}
                          </div>
                        ))}
                        <div>
                          <ButtonDashed size="small" leftIcon={iconType.PlusCircleFilled} onClick={() => setAddresses([...addresses, ''])}>
                            Add another
                          </ButtonDashed>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            )}
            <TextArea name="send-email-message" label="Message" placeholder="Insert text" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} />
          </div>
        )}

        {step === 'files' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography>Choose the type of file you want to share with the employees.</Typography>
            <ChoiceCard name="send-format" tinted checked={format === 'docx'} onSelect={() => setFormat('docx')} icon={<FileDocxIcon />} title=".docx" />
            <ChoiceCard name="send-format" tinted checked={format === 'pdf'} onSelect={() => setFormat('pdf')} icon={<FilePdfIcon />} title=".PDF" />
          </div>
        )}
      </div>
    </Panel>
  )
}
