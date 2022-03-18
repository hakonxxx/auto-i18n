import ts from 'typescript'
import { extractTemplateArgs } from '../utils/extractTemplateArgs.js'
import { Rule } from '../types.js'
import { Transformer } from '../core/Transformer.js'

export const transformWrapCall = (node: ts.TemplateExpression, i18nCallName = 'i18nCall', originArg?: ts.Node) => {
  const { namePairs, transformed } = extractTemplateArgs(node)
  const argsProperties = namePairs.map(({ key, expr, short }) => {
    if (short && ts.isIdentifier(expr)) {
      return ts.factory.createShorthandPropertyAssignment(key)
    }
    return ts.factory.createPropertyAssignment(key, expr)
  })
  const args = ts.factory.createObjectLiteralExpression(argsProperties, true)
  const optsProperties: ts.ObjectLiteralElementLike[] = []
  if (originArg && ts.isObjectLiteralExpression(originArg)) {
    originArg?.forEachChild(property => {
      if (ts.isObjectLiteralElementLike(property)) {
        optsProperties.push(property)
      }
    })
  }
  optsProperties.push(ts.factory.createPropertyAssignment('args', args))
  const opts = ts.factory.createObjectLiteralExpression(optsProperties, true)
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(i18nCallName),
    undefined,
    [transformed, opts]
  )
}

const wrapCallRule: Rule = (origin, transformed) =>
  !!transformed &&
  !ts.isTemplateExpression(origin.parent) &&
  ts.isTemplateExpression(transformed)

export const wrapCall = new Transformer(
  (origin, transformed, context, opts) => transformWrapCall(
    transformed as ts.TemplateExpression,
    opts?.i18nCallName
  ),
  [wrapCallRule]
)