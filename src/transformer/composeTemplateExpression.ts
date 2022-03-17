import ts from 'typescript'
import { isPlusBinaryExpression } from '../utils/is.js'

export const composeTemplateExpression = (nodes: ts.Expression[]) => {
  const args: (ts.Expression | string)[] = ['']
  nodes.forEach((node) => {
    if (ts.isParenthesizedExpression(node)) {
      node = node.expression
    }
    if (ts.isTemplateExpression(node)) {
      node.forEachChild((child) => {
        if (ts.isTemplateHead(child)) {
          if (typeof args[args.length - 1] === 'string') {
            args[args.length - 1] = args[args.length - 1] + child.text
          } else {
            args.push(child.text)
          }
        } else if (ts.isTemplateSpan(child)) {
          args.push(child.expression)
          args.push(child.literal.text)
        }
      })
    } else if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      if (typeof args[args.length - 1] === 'string') {
        args[args.length - 1] = args[args.length - 1] + node.text
      } else {
        args.push(node.text)
      }
    } else {
      args.push(node)
    }
  })
  const head = ts.factory.createTemplateHead(args[0] as string)
  const spans: ts.TemplateSpan[] = []
  for (let i = 1; i < args.length; i += 1) {
    if (typeof args[i] !== 'string') {
      const cur = args[i] as ts.Expression
      const next = typeof args[i + 1] === 'string' ? args[i + 1] as string : ''
      if (next) {
        i += 1
      }
      const literal =
        i === args.length - 1
          ? ts.factory.createTemplateTail(next)
          : ts.factory.createTemplateMiddle(next)
      spans.push(ts.factory.createTemplateSpan(cur, literal))
    }
  }
  const node = ts.factory.createTemplateExpression(
    head,
    spans
  )
  return node.templateSpans.length ? node : ts.factory.createNoSubstitutionTemplateLiteral(node.head.text)
}

export const composePlusToTemplateExpression = (node: any) => {
  if (!isPlusBinaryExpression(node)) return null
  return composeTemplateExpression([node.left, node.right])
}
