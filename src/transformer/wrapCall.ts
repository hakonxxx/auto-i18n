import ts from 'typescript'
import { extractTemplateArgs } from '../utils/extractTemplateArgs.js'
import { Rule, EndpointExpression, Transform, CoreConfig } from '../types.js'
import { Transformer } from '../core/Transformer.js'
import { isEndpoint } from '../utils/is.js'

export const updateI18nConfig = (config: CoreConfig, callback: Function, replace: boolean) => {
  const { i18nReplace } = config
  config.i18nReplace = replace
  const res = callback()
  config.i18nReplace = i18nReplace
  return res
}

export const ignoreI18n = (node: ts.Node | null, config: CoreConfig) =>
  !node ||
  (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    (
      [
        config.i18nCallName,
        ...(config.i18nReplace ? [] : [config.i18nPlaceholder]),
        ...config.i18nAlias || []
      ].includes(node.expression.escapedText.toString()) ||
      (config.i18nReplace && node.expression.escapedText.toString() !== config.i18nPlaceholder)
    )
  )

const wrapCallRule: Rule = (origin, transformed, context, config) => updateI18nConfig(
  config,
  () =>
    !!transformed &&
    (!transformed.parent || !ts.isTemplateExpression(transformed.parent)) &&
    !ignoreI18n(origin.parent, config) &&
    isEndpoint(transformed),
  false
)

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