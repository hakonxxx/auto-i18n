import ts from 'typescript'
import { isPlusBinaryExpression } from '../utils/is.js'
import { generateTemplate } from '../utils/generateTemplate.js'
import { Transformer } from '../core/Transformer.js'

export const transformPlusToTemplate = (originExpr: ts.BinaryExpression) =>
  generateTemplate([originExpr.left, originExpr.right])

export const plusToTemplate = new Transformer(
  (origin, transformed) => transformPlusToTemplate(transformed as ts.BinaryExpression),
  [isPlusBinaryExpression]
)
