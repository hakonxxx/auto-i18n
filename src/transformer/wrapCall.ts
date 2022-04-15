import ts from 'typescript'
import { extractTemplateArgs } from '../utils/extractTemplateArgs.js'
import { Rule } from '../types.js'
import { Transformer } from '../core/Transformer.js'

type EndpointExpression = ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral | ts.StringLiteral | ts.JsxText

export const transformWrapCall = (node: EndpointExpression, i18nCallName = 'i18nCall', originArg?: ts.Node) => {
  let phrase: string = ''
  let opts: ts.ObjectLiteralExpression | undefined
  const optsProperties: ts.ObjectLiteralElementLike[] = []
  if (ts.isTemplateExpression(node)) {
    const { namePairs, transformed } = extractTemplateArgs(node)
    phrase = transformed
    const argsProperties = namePairs.map(({ key, expr, short }) => {
      if (short && ts.isIdentifier(expr)) {
        return ts.factory.createShorthandPropertyAssignment(key)
      }
      return ts.factory.createPropertyAssignment(key, expr)
    })
    const args = ts.factory.createObjectLiteralExpression(argsProperties, true)
    if (originArg && ts.isObjectLiteralExpression(originArg)) {
      originArg?.forEachChild(property => {
        if (ts.isObjectLiteralElementLike(property)) {
          optsProperties.push(property)
        }
      })
    }
    optsProperties.push(ts.factory.createPropertyAssignment('args', args))
    opts = ts.factory.createObjectLiteralExpression(optsProperties, true)
  } else {
    phrase = ts.isJsxText(node) ? node.text.trim() : node.text
  }

  if (!phrase.match(/[a-zA-Z]{2}/)) return null

  const call = ts.factory.createCallExpression(
    ts.factory.createIdentifier(i18nCallName),
    undefined,
    [ts.factory.createStringLiteral(phrase), ...opts ? [opts] : []]
  )

  if (!ts.isJsxText(node)) return call

  return ts.factory.createJsxExpression(undefined, call)
}

const wrapCallRule: Rule = (origin, transformed) =>
  !!transformed &&
  (!origin.parent || !ts.isTemplateExpression(origin.parent)) &&
  (
    ts.isTemplateExpression(transformed) ||
    ts.isNoSubstitutionTemplateLiteral(transformed) ||
    ts.isStringLiteral(transformed) ||
    ts.isJsxText(transformed)
  )

export const wrapCall = new Transformer(
  (origin, transformed, context, opts) => transformWrapCall(
    transformed as EndpointExpression,
    opts?.i18nCallName
  ),
  [wrapCallRule]
)