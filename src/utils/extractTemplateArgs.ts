import ts from 'typescript'
import { TransformExpressionName, ExpressionNamePairWithExpr } from '../types.js'

const transformExpressionName: TransformExpressionName = (expr, index) => {
  let exprName = ''
  let short = false
  if (ts.isCallExpression(expr)) {
    expr = expr.expression
  }
  if (ts.isIdentifier(expr)) {
    exprName = expr.escapedText as string
    short = true
  }
  return {
    key: exprName || index.toString(),
    value: `{{${exprName || index}}}`,
    short
  }
}

export const extractTemplateArgs = (node: ts.TemplateExpression, transform = transformExpressionName) => {
  const namePairs: ExpressionNamePairWithExpr[] = []
  let index = 0
  let transformed = ''
  node.forEachChild((child) => {
    if (ts.isTemplateSpan(child)) {
      const pair = transform(child.expression, index)
      transformed = transformed + pair.value + child.literal.text
      namePairs.push({
        ...pair,
        expr: child.expression
      })
      index += 1
    } else if (ts.isTemplateHead(child)) {
      transformed = transformed + child.text
    }
  })
  return {
    namePairs,
    transformed,
  }
}