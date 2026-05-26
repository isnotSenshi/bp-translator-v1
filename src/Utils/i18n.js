import { strings } from '../Constants/strings.js'

export const t = (key, lang = 'es') => strings[lang]?.[key] ?? key
