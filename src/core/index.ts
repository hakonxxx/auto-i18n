import ts from 'typescript'
import { IJob, JobContextMap, CoreConfig, ICoreContext } from '../types.js'
import { CoreContext } from './Context.js'
import { i18nPlaceholder, i18nCallName, i18nMatch } from '../constants.js'


export class Core {
  static instance: Core | undefined
  static getInstance(sourceFile: ts.Node, config?: CoreConfig) {
    return Core.instance = Core.instance || new Core(sourceFile, config)
  }
  static executeJobs(jobs: IJob[], node: ts.Node, transformed: ts.Node, context: ICoreContext, config: CoreConfig) {
    let next: ts.Node = transformed
    for (let i = 0; i < jobs.length; i += 1) {
      const { rules } = jobs[i].jobConfig || {}
      if (!rules || rules.every(rule => rule(node, next, context, config))) {
        next = Core.executeJob(jobs[i], node, next, context, config) || next
      }
    }
    return next
  }
  static executeJob(job: IJob, node: ts.Node, transformed: ts.Node, context: ICoreContext, config: CoreConfig) {
    let next: ts.Node = transformed
    const additions = new Array(job.tasks.length).fill(null)
    for (let i = 0; i < job.tasks.length; i += 1) {
      const { rules, transform, taskConfig } = job.tasks[i]
      let taskRes: ts.Node | null = null
      if (rules.every(rule => rule(node, next, context, config))) {
        const { transformed, addition } = transform(node, next, context, config)
        taskRes = transformed
        additions[i] = addition
      }
      if (taskRes) {
        next = taskRes
      } else if (!taskConfig?.ignoreInvalid) return null
    }
    config?.collectAdditions?.(job, additions, node, transformed, next)
    return next
  }
  static isIgnore(node: ts.Node, context: ICoreContext, config?: CoreConfig) {
    if (config?.ignoreKinds?.includes(node.kind)) return true
    if (config?.ignores?.some(i => i(node, context))) return true
    return false
  }

  sourceFile: ts.Node
  config: CoreConfig
  jobs: IJob[] = []
  jobContextMap: JobContextMap = new Map()
  coreContext: CoreContext

  constructor(sourceFile: ts.Node, config?: CoreConfig) {
    this.sourceFile = sourceFile
    this.config = {
      ...baseConfig,
      ...config
    }
    this.coreContext = new CoreContext()
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

  beforeTraverse(node: ts.Node) {
    const locks: boolean[] = []
    const unlocks: boolean[] = []
    // TODO: more context
    this.jobs.forEach(job => {
      locks.push(!!job.jobConfig?.lock?.(node, this.coreContext))
      unlocks.push(!!job.jobConfig?.unlock?.(node, this.coreContext))
    })
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
    this.coreContext.count(node, 1)
    return {
      unlockJobs
    }
  }

  afterTraverse(node: ts.Node) {
    this.jobs.forEach(job => {
      this.jobContextMap.get(job)?.lockStack.pop()
    })
    this.coreContext.count(node, -1)
  }

  traverse() {
    return ts.transform(
      this.sourceFile,
      [
        (context) => (root) => {
          this.coreContext.context = context
          if (Core.isIgnore(root, this.coreContext, this.config)) return root
          const visit: ts.Visitor = (node) => {
            if (Core.isIgnore(node, this.coreContext, this.config)) return node
            const { unlockJobs } = this.beforeTraverse(node)
            // from bottom to top
            let transformed = ts.visitEachChild(node, visit, context)
            transformed = Core.executeJobs(unlockJobs, node, transformed, this.coreContext, this.config) || transformed
            this.afterTraverse(node)
            return transformed
          }
          return ts.visitNode(root, visit)
        },
      ],
      // { jsx: ts.JsxEmit.React }
    )
  }
}

const baseConfig: CoreConfig = {
  ignores: [
    (node) => {
      const fullText = node.getFullText()
      const commentRanges = ts.getLeadingCommentRanges(fullText, 0)
      if (commentRanges?.some(({ pos, end }) => fullText.slice(pos, end + 1).match(/i18n ignore/ig))) return true
      return false
    },
    (node) => {
      if (!ts.isCallExpression(node)) return false
      let callName = ''
      if (ts.isIdentifier(node.expression)) {
        callName = node.expression.escapedText.toString()
      } else if (ts.isPropertyAccessExpression(node.expression)) {
        callName = node.expression.name.escapedText.toString()
      }
      return [
        'useColorModeValue',
        'useTranslation',
        'log',
        'translationFn',
        'addEventListener',
        'removeEventListener',
        'format',
        'emit',
        'on',
        'off',
        'mode',
        'url',
      ].includes(callName)
    }
  ],
  ignoreKinds: [
    ts.SyntaxKind.EnumDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.TypeLiteral,
    ts.SyntaxKind.TypeParameter,
    ts.SyntaxKind.TypeReference,
    ts.SyntaxKind.TypeAliasDeclaration,
    ts.SyntaxKind.ElementAccessExpression,
    ts.SyntaxKind.ModuleDeclaration,
  ],
  collectAdditions: (job, additions) => console.log(additions),

  i18nMatch,
  i18nCallName,
  i18nPlaceholder,
}