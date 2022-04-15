import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import { fileURLToPath } from 'url'
import { plusToTemplate } from './transformer/plusToTemplate.js'
import { wrapCall } from './transformer/wrapCall.js'

import { Core } from './core/index.js'
import { Job } from './core/Job.js'
import { isInvalidBinaryExpression } from './utils/is.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const code = fs.readFileSync(
  // path.resolve(__dirname, '../scripts/template/string-plus.ts'),
  path.resolve(__dirname, '../scripts/template/test1.tsx'),
  'utf-8'
)
const sourceFile = ts.createSourceFile(
  'test.tsx',
  code,
  ts.ScriptTarget.Latest,
  /*setParentNodes */ true
)

const core = Core.getInstance(sourceFile)
const job1 = [
  plusToTemplate,
  wrapCall
]
// const job2 = [parseCommentArgs, parseFunctionArgsAfterSomeComment]
core.addJob(new Job(job1, {
  lock: (node) => {
    if (ts.isTaggedTemplateExpression(node)) return true
    if (isInvalidBinaryExpression(node)) return true
    return false
  }
}))

const result = core.traverse()
const transformedNodes = result.transformed[0]

const printer: ts.Printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false
})

const newCode = printer.printNode(ts.EmitHint.SourceFile, transformedNodes, sourceFile)

console.log(newCode)
