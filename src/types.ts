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

export interface ITransformer {
  transform: Transform
  rules: Rule[]
  jump?: boolean
}
