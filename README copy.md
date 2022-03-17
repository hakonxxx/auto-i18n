# auto-i18n

## ignore
1. EnumDeclaration
2. InterfaceDeclaration
3. TypeLiteral
4. TypeParameter
5. TypeReference
6. TypeAliasDeclaration
7. file name /type\.ts|(.+\.d\.ts)/
8. ElementAccessExpression
9. ModuleDeclaration

## top-level entry
1. VariableDeclaration.initializer
2. BinaryExpression.right
3. FunctionDeclaration.body
4. ArrowFunction.body.kind === Block
5. CallExpression.arguments
6. JsxElement.children: [JsxText.text, JsxExpression.expression]
7. Parameter.initializer

## second-level entry
1. ArrayLiteralExpression.elements
2. ObjectLiteralExpression.PropertyAssignment: [PropertyAssignment.initializer]
3. JsxAttributes.properties: [JsxAttribute.initializer]

ts.getLeadingCommentRanges(fileFullText, pos)
ts.getTrailingCommentRanges(fileFullText, end)
如果注释出现在pos === 0的位置，忽略整个文件
code.slice(MultiLineCommentTrivia.pos, MultiLineCommentTrivia.end).match(/i18n ignore/ig)
code.slice(SingleLineCommentTrivia.pos, SingleLineCommentTrivia.end).match(/i18n ignore/ig)


## ignore settings
(node) => boolean
1. a.format: (node) => node.kind === CallExpression && node.expression.name === 'format'

(node, kind) => boolean
1. a.format: (node, kind = CallExpression) => node.expression.name === 'format'
2. log: (node, kind = CallExpression) => node.expression.name === 'log' || node.expression.escapedText === 'log'

ignoreCallName: (node) => {
  const [name, type] = ['format', 'all']
  // all, propertyAccess, directCall
  if (type === 'all') {
    return node.expression.name === name || node.expression.escapedText === name
  }
  if (type === 'propertyAccess') {
    return node.expression.name === name
  }
  return node.expression.escapedText === name
}
### ignore list
useColorModeValue
useTranslation
log
translationFn
addEventListener
removeEventListener
.format
emit
on
off
mode
url

## end point
1. transform string plus to NoSubstitutionTemplateLiteral or TemplateLiteral(maybe need to traverse if there are args or expression)
2. if isn`t a string plus, directly transform phrase to function call if the phrase is matched

BinaryExpression: traverse first
a + b + c => BinaryExpression(BinaryExpression(a + b), c)
if there is any side of a BinaryExpression match the phrase rule, 

then generate TemplateLiteral(`${a + b}${c}`), return this node (notice that, a + c has been transformed to target node when traverse)


ConditionalExpression[whenTrue | whenFalse] 


jsx props:

initial:
value
text
label
content
aria-label
title
description
errorMessage
confirmText
warningMessage
pageTitle
subTitle
chartTitle

object:
placeholder
