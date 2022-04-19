# auto-i18n

## ignore
7. file name /type\.ts|(.+\.d\.ts)/

<!-- ## top-level entry
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
3. JsxAttributes.properties: [JsxAttribute.initializer] -->

### ignore list
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
placeholder

object:
placeholder
