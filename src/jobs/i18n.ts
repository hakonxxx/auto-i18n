import ts from 'typescript'
import { plusToTemplate } from '../transformer/plusToTemplate.js'
import { wrapCall } from '../transformer/wrapCall.js'
import { replaceCall } from '../transformer/replaceCall.js'

import { Job } from '../core/Job.js'
import { isInvalidBinaryExpression } from '../utils/is.js'

export const i18nInitializer = new Job([
  plusToTemplate,
  wrapCall
], {
  lock: (node) => {
    if (ts.isTaggedTemplateExpression(node)) return true
    if (isInvalidBinaryExpression(node)) return true

    // TODO:
    // if (ts.isJsxAttribute(node) && [
    //   'style'
    // ].includes(node.name.escapedText.toString())) return true

    return false
  },
  rules: [
    (origin, transformed, context, config) => {
      if ([
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.ArrowFunction
      ].every(kind => !context.kindCounter[kind])) return false

      if (context.kindCounter[ts.SyntaxKind.JsxAttribute]) {
        // JSX attr
        const whitelist = [
          'value',
          'text',
          'label',
          'content',
          'aria-label',
          'title',
          'description',
          'errorMessage',
          'confirmText',
          'warningMessage',
          'pageTitle',
          'subTitle',
          'chartTitle',
          'placeholder',
        ]
        if (origin.parent && [
          ts.SyntaxKind.JsxAttribute,
          ts.SyntaxKind.PropertyAssignment
        ].includes(origin.parent.kind)) {
          const name = (origin.parent as (ts.JsxAttribute | ts.PropertyAssignment)).name
          if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
            return whitelist.includes(name.text)
          }
          if (ts.isIdentifier(name)) {
            return whitelist.includes(name.escapedText.toString())
          }
        }
        return false
      }

      return [
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.BinaryExpression,
        ts.SyntaxKind.CallExpression,
        ts.SyntaxKind.JsxElement,
        ts.SyntaxKind.Parameter,
        ts.SyntaxKind.ArrayLiteralExpression,
        ts.SyntaxKind.ObjectLiteralExpression,
        ts.SyntaxKind.JsxAttributes,
      ].some(kind => context.kindCounter[kind])
    }
  ]
})

export const i18nIncrementalUpdater = new Job([
  plusToTemplate,
  replaceCall
], {
  lock: (node) => {
    if (ts.isTaggedTemplateExpression(node)) return true
    if (isInvalidBinaryExpression(node)) return true
    return false
  },
  rules: [
    (origin, transformed, context, config) => {
      if ([
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.ArrowFunction
      ].every(kind => !context.kindCounter[kind])) return false
      return true
    }
  ]
})