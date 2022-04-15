import { Rule, Transform, ITask } from '../types.js'

const baseTaskConfig: ITask['taskConfig'] = {
  ignoreInvalid: false,
}

export class Transformer implements ITask {
  transform: ITask['transform']
  rules: ITask['rules']
  taskConfig: ITask['taskConfig']

  constructor(transform: Transform, rules: Rule[], taskConfig?: ITask['taskConfig']) {
    this.transform = transform
    this.rules = rules
    this.taskConfig = { ...baseTaskConfig, ...taskConfig }
  }

  copy(transform?: Transform, rules?: Rule[], taskConfig?: ITask['taskConfig']) {
    return new Transformer(
      transform || this.transform,
      rules || [...this.rules],
      taskConfig || { ... this.taskConfig }
    )
  }
}