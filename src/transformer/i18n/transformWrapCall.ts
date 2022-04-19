import ts from 'typescript'
import { extractTemplateArgs } from '../../utils/extractTemplateArgs.js'
import { EndpointExpression, Transform } from '../../types.js'

export const transformWrapCall: Transform = (origin, transformed, context, config) => {
  const node = transformed as EndpointExpression
  const { i18nCallName } = config
  let originArg: ts.Node | undefined
  if (config.i18nReplace && ts.isCallExpression(origin.parent)) {
    originArg = origin.parent.arguments[1]
  }
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

  if (!phrase.match(config.i18nMatch)) return { transformed: null }

  const call = ts.factory.createCallExpression(
    ts.factory.createIdentifier(i18nCallName),
    undefined,
    [ts.factory.createStringLiteral(phrase), ...opts ? [opts] : []]
  )

  if (
    ts.isJsxText(node) ||
    (node.parent && ts.isJsxAttribute(node.parent) && node.parent.initializer === node)
  ) return {
    transformed: ts.factory.createJsxExpression(undefined, call),
    addition: [phrase, optsProperties],
  }
  return {
    transformed: call,
    addition: [phrase, optsProperties],
  }
}
