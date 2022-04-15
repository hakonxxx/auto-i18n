import ts from 'typescript'

export type ExpressionNamePair = {
  key: string
  value: string
  short: boolean
}

export type ExpressionNamePairWithExpr = ExpressionNamePair & {
  expr: ts.Expression
}

export interface TransformExpressionName {
  (expr: ts.Expression, index: number): ExpressionNamePair
}

export interface Transform {
  (originExpr: ts.Node, transformed: ts.Node | null, context: ts.TransformationContext, config?: CoreConfig): {
    transformed: ts.Node | null
    addition?: any[]
  }
}

export interface Rule {
  (originExpr: ts.Node, transformed: ts.Node | null, context: ts.TransformationContext, config?: CoreConfig): boolean
}

export type TaskConfig = {
  ignoreInvalid?: boolean
}

export interface ITask {
  transform: Transform
  rules: Rule[]
  taskConfig?: TaskConfig
}

export type JobConfig = {
  // ignoreInvalid?: boolean
  lock?: (node: ts.Node, context: ts.TransformationContext) => boolean
  unlock?: (node: ts.Node, context: ts.TransformationContext) => boolean
}

export interface IJob {
  tasks: ITask[]
  jobConfig?: JobConfig
}

export type JobContext = {
  lockStack: boolean[]
}

export type JobContextMap = Map<IJob, JobContext>

export type CoreConfig = {
  ignoreKinds?: ts.SyntaxKind[]
  ignores?: ((node: ts.Node, context: ts.TransformationContext) => boolean)[]
  collectAdditions?: (job: IJob, additions: any[], origin: ts.Node, transformed: ts.Node, next: ts.Node) => void

  i18nCallName?: string

  [key: string]: any
}
