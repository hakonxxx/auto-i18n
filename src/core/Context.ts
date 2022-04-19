import ts from 'typescript'
import { ICoreContext } from '../types.js'

export class CoreContext implements ICoreContext {
  context: ts.TransformationContext | undefined
  kindCounter: {
    [kind: number]: number
  } = {}

  constructor(context?: ts.TransformationContext) {
    this.context = context
  }

  count(origin: ts.Node, action: 1 | -1) {
    this.kindCounter[origin.kind] = (this.kindCounter[origin.kind] || 0) + action
  }
}
