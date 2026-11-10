// The gender-dependent wording in the document previews, by Employee gender.

export type Gender = 'male' | 'female' | 'diverse'
export type GenderForms = Record<Gender, string>

export const asGender = (gender: string | undefined): Gender | undefined =>
  gender === 'male' || gender === 'female' || gender === 'diverse' ? gender : undefined

export const NOMINATIVE: GenderForms = { male: 'Der Arbeitnehmer', female: 'Die Arbeitnehmerin', diverse: 'Die arbeitnehmende Person' }
export const nominative: GenderForms = { male: 'der Arbeitnehmer', female: 'die Arbeitnehmerin', diverse: 'die arbeitnehmende Person' }
export const GENITIVE: GenderForms = { male: 'des Arbeitnehmers', female: 'der Arbeitnehmerin', diverse: 'der arbeitnehmenden Person' }
export const FROM: GenderForms = { male: 'vom Arbeitnehmer', female: 'von der Arbeitnehmerin', diverse: 'von der arbeitnehmenden Person' }
export const TERM: GenderForms = { male: 'Arbeitnehmer', female: 'Arbeitnehmerin', diverse: 'Arbeitnehmende Person' }
export const PRONOUN: GenderForms = { male: 'er', female: 'sie', diverse: 'sie' }
