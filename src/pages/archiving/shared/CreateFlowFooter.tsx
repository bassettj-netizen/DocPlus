import { ButtonGhost, ButtonPrimary } from '@goat-ui/goat-ui-core'
import FlowToolbar, { FlowSteps } from './FlowToolbar'
import { useArchivingVersion } from './version'

interface CreateFlowFooterProps {
  /** This screen's index in FLOW_STEPS — shown only by versions with the steps toolbar. */
  step: number
  onBack?: () => void
  onContinue: () => void
  continueDisabled: boolean
}

export default function CreateFlowFooter({ step, onBack, onContinue, continueDisabled }: CreateFlowFooterProps) {
  const { stepsToolbar } = useArchivingVersion()
  return (
    <FlowToolbar
      left={onBack && <ButtonGhost onClick={onBack}>Back</ButtonGhost>}
      center={stepsToolbar && <FlowSteps current={step} />}
      right={
        <ButtonPrimary disabled={continueDisabled} onClick={onContinue}>
          Continue
        </ButtonPrimary>
      }
    />
  )
}
