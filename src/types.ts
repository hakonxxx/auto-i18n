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
  (originExpr: ts.Node, transformed: ts.Node | null, context: ts.TransformationContext, opts?: any): ts.Node | null
}

export interface Rule {
  (originExpr: ts.Node, transformed: ts.Node | null, context: ts.TransformationContext, opts?: any): boolean
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
  ignoreInvalid?: boolean
  lockKinds?: ts.SyntaxKind[]
  unlockKinds?: ts.SyntaxKind[]
}

export interface IJob {
  tasks: ITask[]
  jobConfig?: JobConfig
}

export type JobContext = {
  lockStack: boolean[]
}

export type JobContextMap = Map<IJob, JobContext>