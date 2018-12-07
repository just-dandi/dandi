import { Uuid } from '@dandi/common'
import { Inject, Injectable } from '@dandi/core'

import { Db } from '../shared/db'

import { Task } from './task'

export const TASK_DB_PREFIX = 'task'

@Injectable()
export class TaskManager {
  constructor(@Inject(Db) private db: Db) {}

  public getTask(taskId: Uuid): Promise<Task> {
    return this.db.get(`${TASK_DB_PREFIX}:${taskId}`)
  }

  public async putTask(task: Task): Promise<Task> {
    let index = await this.db.get(TASK_DB_PREFIX)
    if (!index) {
      index = new Set<Uuid>()
      await this.db.set(TASK_DB_PREFIX, index)
    }
    const result = await this.db.set(`${TASK_DB_PREFIX}:${task.taskId}`, task)
    index.add(task.taskId)
    return result
  }
}
