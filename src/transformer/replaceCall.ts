import ts from 'typescript'
import { Rule } from '../types.js'
import { transformWrapCall, ignoreI18n, updateI18nConfig } from './wrapCall.js'
import { Transformer } from '../core/Transformer.js'
import { isEndpoint } from '../utils/is.js'

export const replaceCallRule: Rule = (origin, transformed, context, config) => updateI18nConfig(
  config,
  () =>
    !!transformed &&
    ts.isCallExpression(transformed) &&
    // (!transformed.parent || !ts.isTemplateExpression(transformed.parent)) &&
    !ignoreI18n(transformed, config) &&
    isEndpoint(transformed.arguments[0]),
  true
)

export const replaceCall = new Transformer(
  (origin, transformed, context, config) => updateI18nConfig(
    config,
    () => {
      const { i18nReplace } = config
      config.i18nReplace = true
      const res = transformWrapCall(origin, (transformed as ts.CallExpression).arguments[0], context, config)
      config.i18nReplace = i18nReplace
      return res
    },
    true
  ),
  [replaceCallRule]
)
