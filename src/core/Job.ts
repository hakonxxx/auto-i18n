import { IJob, ITask, JobConfig } from '../types.js'

const baseJobConfig: JobConfig = {
}

export class Job implements IJob {
  tasks: ITask[] = []
  jobConfig?: JobConfig | undefined

  constructor(tasks: ITask[], jobConfig?: JobConfig) {
    this.tasks = tasks
    this.jobConfig = {
      ...baseJobConfig,
      ...jobConfig
    }
  }

  copy(tasks?: ITask[], jobConfig?: JobConfig) {
    return new Job(
      tasks || [...this.tasks],
      jobConfig || { ...this.jobConfig }
    )
  }
}