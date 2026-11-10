import type { ReactNode } from 'react'
import { constants } from '@goat-ui/goat-ui-core'
import { asGender, type GenderForms } from './genderForms'

const { colorPalette } = constants

// The document previews' variable fields, as in the live product (Archiving,
// Send via email, Bulk approvals Version 8). Colours sampled from it — not
// design-system tokens. Input fields are orange, gender-dependent wording
// cyan. Unfilled, a field shows its name (or its alternatives) on that
// colour; once filled, the value sits in a 1px outline of the same colour.
const INPUT_COLOR = '#FEE9C1'
const GENDER_COLOR = '#B4F1F3'

function Field({ color, filled, children }: { color: string; filled: boolean; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline',
        borderRadius: 2,
        padding: filled ? '0 3px' : '1px 2px',
        border: filled ? `1px solid ${color}` : 'none',
        backgroundColor: filled ? colorPalette.white : color,
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
  )
}

/** An input field: "{label}" until it's filled in, then its value. */
export function Input({ value, label }: { value?: string; label: string }) {
  const filled = !!value?.trim()
  return (
    <Field color={INPUT_COLOR} filled={filled}>
      {filled ? value : `{${label}}`}
    </Field>
  )
}

/** Wording that depends on a choice: every alternative ("|| a | b ||") until it's made, then the chosen one. */
export function Choice({ options, chosen }: { options: string[]; chosen?: string }) {
  return (
    <Field color={GENDER_COLOR} filled={!!chosen}>
      {chosen ?? `|| ${options.join(' | ')} ||`}
    </Field>
  )
}

/** Gender-dependent wording: all three forms until a gender is chosen, then that one. */
export function Gendered({ gender, forms }: { gender?: string; forms: GenderForms }) {
  const known = asGender(gender)
  return <Choice options={[forms.male, forms.female, forms.diverse]} chosen={known && forms[known]} />
}
