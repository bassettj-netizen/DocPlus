// The document editor's field values, and the rules for when a document
// counts as complete. Shared by the form and both versions' editors.

export interface DocumentFields {
  title: string
  headerFooter?: string
  coverLetter?: string
  gender?: string
  // Intro
  employer: string
  firstName: string
  lastName: string
  // "Auf wessen Wunsch erfolgt die Teilnahme an der Fortbildung?"
  requestedBy?: string
  // Lehrgangskosten
  total: string
  costCoverage: string
  tuition: string
  continuedPay: string
  travel: string
}

export function emptyFields(title: string): DocumentFields {
  return { title, employer: '', firstName: '', lastName: '', total: '', costCoverage: '', tuition: '', continuedPay: '', travel: '' }
}

const filled = (values: (string | undefined)[]) => values.filter((value) => !!value && value.trim() !== '').length

export function sectionCounts(fields: DocumentFields) {
  return {
    intro: filled([fields.employer, fields.firstName, fields.lastName]),
    requestedBy: filled([fields.requestedBy]),
    costs: filled([fields.total, fields.costCoverage, fields.tuition, fields.continuedPay, fields.travel]),
  }
}

/**
 * Ready to finish: the starred questions and the Intro and "Auf wessen
 * Wunsch" sections are complete. Lehrgangskosten is optional — the Figma
 * "ready to finish" screen has it at 1/5.
 */
export function isComplete(fields: DocumentFields) {
  const counts = sectionCounts(fields)
  return !!fields.title.trim() && !!fields.coverLetter && !!fields.gender && counts.intro === 3 && counts.requestedBy === 1
}
