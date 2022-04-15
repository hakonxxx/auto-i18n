import ts from 'typescript'
import { IJob, JobContextMap } from '../types.js'

type CoreConfig = {
  ignoreKinds?: ts.SyntaxKind[]
}

const baseConfig: CoreConfig = {
  ignoreKinds: [
    ts.SyntaxKind.EnumDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.TypeLiteral,
    ts.SyntaxKind.TypeParameter,
    ts.SyntaxKind.TypeReference,
    ts.SyntaxKind.TypeAliasDeclaration,
    ts.SyntaxKind.ElementAccessExpression,
    ts.SyntaxKind.ModuleDeclaration,
  ]
}

export class Core {
  static instance: Core | undefined
  static getInstance(sourceFile: ts.Node, config?: CoreConfig) {
    return Core.instance = Core.instance || new Core(sourceFile, config)
  }
  static prepareContext(jobs: IJob[], node: ts.Node, context: ts.TransformationContext) {
    const locks: boolean[] = []
    const unlocks: boolean[] = []
    // TODO: more context
    jobs.forEach(job => {
      locks.push(!!job.jobConfig?.lockKinds?.includes(node.kind))
      unlocks.push(!!job.jobConfig?.unlockKinds?.includes(node.kind))
    })
    return {
      locks,
      unlocks
    }
  }
  static executeJobs(jobs: IJob[], node: ts.Node, transformed: ts.Node, context: ts.TransformationContext) {
    let next: ts.Node = transformed
    for (let i = 0; i < jobs.length; i += 1) {
      const jobRes = Core.executeJob(jobs[i], node, next, context)
      if (jobRes) {
        next = jobRes
      } else if (jobs[i].jobConfig?.ignoreInvalid) return null
    }
    return next
  }
  static executeJob(job: IJob, node: ts.Node, transformed: ts.Node, context: ts.TransformationContext) {
    let next: ts.Node = transformed
    for (let i = 0; i < job.tasks.length; i += 1) {
      const { rules, transform, taskConfig } = job.tasks[i]
      let taskRes: ts.Node | null = null
      try {
        if (rules.every(rule => rule(node, next, context))) {
          taskRes = transform(node, next, context)
        }
      } catch (err) {
        console.log(err)
      }
      if (taskRes) {
        next = taskRes
      } else if (!taskConfig?.ignoreInvalid) return null
    }
    return next
  }

  sourceFile: ts.Node
  config: CoreConfig | undefined
  jobs: IJob[] = []
  jobContextMap: JobContextMap = new Map()

  constructor(sourceFile: ts.Node, config?: CoreConfig) {
    this.sourceFile = sourceFile
    this.config = {
      ...baseConfig,
      ...config
    }
  }

  addJob(job: IJob) {
    this.jobs.push(job)
    this.jobContextMap.set(job, {
      lockStack: [false]
    })
  }

  removeJob(job: IJob) {
    this.jobs = this.jobs.filter(_job => job !== _job)
    this.jobContextMap.delete(job)
  }

  traverse() {
    return ts.transform(
      this.sourceFile,
      [
        (context) => (root) => {
          const visit: ts.Visitor = (node) => {
            // if (this.config?.ignoreKinds?.includes(node.kind)) return node
            const { locks, unlocks } = Core.prepareContext(this.jobs, node, context)
            const unlockJobs: IJob[] = []
            this.jobs.forEach((job, i) => {
              const lockStack = this.jobContextMap.get(job)?.lockStack
              if (lockStack) {
                const lastStatus = lockStack[lockStack.length - 1]
                if (!lastStatus) {
                  lockStack.push(locks[i])
                } else {
                  lockStack.push(!unlocks[i])
                }
              }
              if (!lockStack?.[lockStack.length - 1]) {
                unlockJobs.push(job)
              }
            })
            console.log(node.kind)
            // from bottom to top
            const transformed = ts.visitEachChild(node, visit, context)
            this.jobs.forEach(job => {
              this.jobContextMap.get(job)?.lockStack.pop()
            })
            return Core.executeJobs(unlockJobs, node, transformed, context) || transformed
          }
          return ts.visitNode(root, visit)
        },
      ],
      // { jsx: ts.JsxEmit.React }
    )
  }
}