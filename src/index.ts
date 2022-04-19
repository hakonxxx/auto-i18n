import fs from 'fs'
import path from 'path'
import ts from 'typescript'

import { Core } from './core/index.js'
import { i18nInitializer, i18nIncrementalUpdater } from './jobs/i18n.js'

import { repoDir } from './utils/dir.js'

const code = fs.readFileSync(
  // path.resolve(__dirname, '../scripts/template/string-plus.ts'),
  path.resolve(repoDir, 'scripts/template/test1.tsx'),
  'utf-8'
)
const sourceFile = ts.createSourceFile(
  'test.tsx',
  code,
  ts.ScriptTarget.Latest,
  /*setParentNodes */ true
)

const core = Core.getInstance(sourceFile)
core.addJob(i18nInitializer)
// core.addJob(i18nIncrementalUpdater)

const result = core.traverse()
const transformedNodes = result.transformed[0]

const printer: ts.Printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false
})

const newCode = printer.printNode(ts.EmitHint.SourceFile, transformedNodes, sourceFile)

console.log(newCode)
