import ts from 'typescript'

export const isPlusBinaryExpression = (node: ts.Node | null) =>
  !!node && ts.isBinaryExpression(node) &&
  node.operatorToken.kind === ts.SyntaxKind.PlusToken

export const isInvalidBinaryExpression = (node: ts.Node) => ts.isBinaryExpression(node) && ![
  ts.SyntaxKind.PlusToken,
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.AmpersandAmpersandToken,
  ts.SyntaxKind.BarBarToken
].includes(node.operatorToken.kind)
