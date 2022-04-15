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
    const argsProperties = namePairs.map(({ key, expr, short }) => {
      if (short && ts.isIdentifier(expr)) {
        return ts.factory.createShorthandPropertyAssignment(key)
      }
      return ts.factory.createPropertyAssignment(key, expr)
    })
    const args = ts.factory.createObjectLiteralExpression(argsProperties, true)
    optsProperties.push(ts.factory.createPropertyAssignment('args', args))
    phrase = transformed
    if (originArg && ts.isObjectLiteralExpression(originArg)) {
      originArg?.forEachChild(property => {
        if (ts.isObjectLiteralElementLike(property)) {
          optsProperties.push(property)
        }
      })
    }
    opts = ts.factory.createObjectLiteralExpression(optsProperties, true)
  } else {
    phrase = ts.isJsxText(node) ? node.text.trim() : node.text
  }

  // TODO:
  if (!phrase.match(/[a-zA-Z]{2}/)) return { transformed: null }

  const call = ts.factory.createCallExpression(
    ts.factory.createIdentifier(i18nCallName),
    undefined,
    [ts.factory.createStringLiteral(phrase), ...opts ? [opts] : []]
  )

  if (!ts.isJsxText(node)) return {
    transformed: call,
    addition: [phrase, optsProperties],
  }

  return {
    transformed: ts.factory.createJsxExpression(undefined, call),
    addition: [phrase, optsProperties],
  }
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
  (origin, transformed, context, config) => transformWrapCall(
    transformed as EndpointExpression,
    config?.i18nCallName
  ),
  [wrapCallRule]
)