import ts from 'typescript'

export const isPlusBinaryExpression = (node) =>
  ts.isBinaryExpression(node) &&
  node.operatorToken.kind === ts.SyntaxKind.PlusToken
