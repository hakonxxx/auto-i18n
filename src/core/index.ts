import ts from 'typescript'
import { Transformer } from './Transformer.js'

export class Core {
  static __instance: Core | null
  static getInstance(sourceFile: ts.Node) {
    return Core.__instance = Core.__instance?.config() || new Core(sourceFile)
  }
  static executeJob(job: Transformer[], node: ts.Node, transformed: ts.Node, context: ts.TransformationContext) {
    let next: typeof transformed | null = transformed
    job.forEach(({ rules, transform, jump }) => {
      if (rules.every(rule => rule(node, next, context))) {
        next = transform(node, next, context)
      } else if (!jump) {
        next = null
      }
    })
    return next
  }

  sourceFile: ts.Node
  options: any

  jobs: Transformer[][] = []

  constructor(sourceFile: ts.Node) {
    this.sourceFile = sourceFile
  }

  config() {
    return this
  }

  addJob(job: Transformer[]) {
    this.jobs.push(job)
  }

  removeJob(job: Transformer[]) {
    this.jobs = this.jobs.filter(_job => job !== _job)
  }

  executeJobs(node: ts.Node, transformed: ts.Node, context: ts.TransformationContext) {
    let next: typeof transformed = transformed
    this.jobs.forEach((job) => {
      next = Core.executeJob(job, node, next, context) || next
    })
    return next
  }

  traverse() {
    return ts.transform(
      this.sourceFile,
      [
        (context) => (root) => {
          const visit: ts.Visitor = (node) => {
            const transformed = ts.visitEachChild(node, visit, context)
            return this.executeJobs(node, transformed, context)
          }
          return ts.visitNode(root, visit)
        },
      ],
      { jsx: ts.JsxEmit.React }
    )
  }
}