import ts from 'typescript'
import fs from 'fs'
import path from 'path'

const code = fs.readFileSync('')
fs.readFileSync(path.resolve(__dirname, '../../inject/inject.production.js'), 'utf-8')
const sourceFile = ts.createSourceFile('test.ts', this.code, ts.ScriptTarget.Latest, /*setParentNodes */ true)
ts.transform()