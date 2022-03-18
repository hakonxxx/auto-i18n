import { Rule, Transform, ITransformer } from '../types.js'

export class Transformer implements ITransformer {
  transform
  rules
  jump

  constructor(transform: Transform, rules: Rule[], jump?: boolean) {
    this.transform = transform
    this.rules = rules
    this.jump = jump
  }

  copy(transform?: Transform, rules?: Rule[], jump?: boolean) {
    return new Transformer(
      transform || this.transform,
      rules || [...this.rules],
      jump || this.jump
    )
  }
}