import ts from 'typescript'

export type ExpressionNamePair = {
  key: string
  value: string
}

export type ExpressionNamePairWithExpr = ExpressionNamePair & {
  expr: ts.Expression
}

export interface TransformExpressionName {
  (expr: ts.Expression, index: number): ExpressionNamePair
}
