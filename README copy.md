# auto-i18n

## ignore
7. file name /type\.ts|(.+\.d\.ts)/

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
