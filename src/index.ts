import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import { fileURLToPath } from 'url'
import { composePlusToTemplateExpression } from './transformer/composeTemplateExpression.js'
import { wrapWithI18nCall } from './transformer/i18nCall.js'
import { isPlusBinaryExpression } from './utils/is.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const code = fs.readFileSync(
  path.resolve(__dirname, '../scripts/template/string-plus.ts'),
  'utf-8'
)
const sourceFile = ts.createSourceFile(
  'test.ts',
  code,
  ts.ScriptTarget.Latest,
  /*setParentNodes */ true
)

const result = ts.transform(
  sourceFile,
  [
    (context) => (root) => {
      const visit = (node) => {
        const next = ts.visitEachChild(node, visit, context)
        const transformedNode = composePlusToTemplateExpression(next)
        if (transformedNode && ts.isTemplateExpression(transformedNode)) {
          if (!isPlusBinaryExpression(node.parent) && ts.isTemplateExpression(transformedNode)) {
            return wrapWithI18nCall(transformedNode, 'i18nCall')
          }
          return transformedNode
        }
        return next
      }
      return ts.visitNode(root, visit)
    },
  ],
  { jsx: ts.JsxEmit.React }
)
const transformedNodes = result.transformed[0]

const printer: ts.Printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false
})

console.log(printer.printNode(ts.EmitHint.SourceFile, transformedNodes, sourceFile))