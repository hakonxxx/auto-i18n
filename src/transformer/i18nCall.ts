import ts from 'typescript'
import { extractTemplateExpressionNames } from '../utils/extractTemplateExpressionNames.js'

export const wrapWithI18nCall = (node: ts.TemplateExpression, i18nCallName: string, _opts?: ts.Node) => {
  const { namePairs, transformed } = extractTemplateExpressionNames(node)
  const argsProperties = namePairs.map(({ key, expr }) => ts.factory.createPropertyAssignment(key, expr))
  const args = ts.factory.createObjectLiteralExpression(argsProperties, true)
  const optsProperties: ts.ObjectLiteralElementLike[] = []
  if (_opts && ts.isObjectLiteralExpression(_opts)) {
    _opts?.forEachChild(property => {
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

export const transformI18nCall = (node: ts.CallExpression, i18nCallName: string) => {
  if (!ts.isTemplateExpression(node.arguments[0])) return null
  return wrapWithI18nCall(node.arguments[0], i18nCallName, node.arguments[1])
}