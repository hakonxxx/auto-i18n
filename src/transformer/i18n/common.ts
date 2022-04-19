import ts from 'typescript'
import { CoreConfig } from '../../types.js'

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
