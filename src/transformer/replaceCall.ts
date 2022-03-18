import ts from 'typescript'
import { Rule } from '../types.js'
import { transformWrapCall } from './wrapCall'
import { Transformer } from '../core/Transformer.js'

export const replaceCallRule: Rule = (origin, transformed) => !!transformed && ts.isCallExpression(transformed) && ts.isTemplateExpression(transformed.arguments[0])

export const replaceCall = new Transformer(
  (origin, transformed, context, opts) => {
    const _transformed = transformed as ts.CallExpression
    if (!ts.isTemplateExpression(_transformed.arguments[0])) return null
    return transformWrapCall(_transformed.arguments[0], opts?.i18nCallName, _transformed.arguments[1])
  },
  [replaceCallRule]
)
