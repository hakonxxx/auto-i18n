import ts from 'typescript'

export const isPlusBinaryExpression = (node: ts.Node | null) =>
  !!node && ts.isBinaryExpression(node) &&
  node.operatorToken.kind === ts.SyntaxKind.PlusToken
