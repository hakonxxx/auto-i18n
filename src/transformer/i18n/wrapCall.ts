import ts from 'typescript'
import { Rule } from '../../types.js'
import { Transformer } from '../../core/Transformer.js'
import { isEndpoint } from '../../utils/is.js'
import { transformWrapCall } from './transformWrapCall.js'
import { ignoreI18n, updateI18nConfig } from './common.js'

const wrapCallRule: Rule = (origin, transformed, context, config) => updateI18nConfig(
  config,
  () =>
    (!transformed.parent || !ts.isTemplateExpression(transformed.parent)) &&
    !ignoreI18n(origin.parent, config) &&
    isEndpoint(transformed),
  false
)

export const wrapCall = new Transformer(
  (origin, transformed, context, config) => updateI18nConfig(
    config,
    () => {
      const { i18nReplace } = config
      config.i18nReplace = false
      const res = transformWrapCall(origin, transformed, context, config)
      config.i18nReplace = i18nReplace
      return res
    },
    false
  ),
  [wrapCallRule]
)