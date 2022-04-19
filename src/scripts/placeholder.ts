import { i18nPlaceholder } from '../constants.js'

type PhaseOpts = {
  translationFileName?: string
  i18nKey?: string
}

declare global {
  interface Window {
    [i18nPlaceholder]: (phase: string, opts?: PhaseOpts) => string
  }
}
global[i18nPlaceholder] = (phase) => phase

export default {}
