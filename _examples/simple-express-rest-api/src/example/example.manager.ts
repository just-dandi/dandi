import { Inject, Injectable } from '@dandi/core'

import { List, ListRequest } from '../lists/list'
import { ListManager } from '../lists/list.manager'
import { ListResource } from '../lists/list.resource'
import { TaskRequest } from '../tasks/task'

const LIST_TITLES = ['Todo', 'Stuff', 'Things', "Don't Forget", 'Honey-dos']

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

@Injectable()
export class ExampleManager {
  constructor(@Inject(ListManager) private listManager: ListManager) {}

  public async addExamples(listCount: number, tasksPerList: number): Promise<ListResource[]> {
    const lists = []
    for (let listNum = 0; listNum < listCount; listNum++) {
      lists.push(this.generateList(tasksPerList))
    }
    return (await Promise.all(lists)).map((list) => new ListResource(list))
  }

  private async generateList(taskCount: number): Promise<List> {
    const tasks = []
    const title = LIST_TITLES[randomInt(0, LIST_TITLES.length - 1)]
    const list = await this.listManager.addList(new ListRequest({ title }))
    await this.listManager.addTask(list.listId, new TaskRequest({ title: `task 1` }))
    for (let taskNum = 1; taskNum < taskCount; taskNum++) {
      tasks.push(this.listManager.addTask(list.listId, new TaskRequest({ title: `task ${taskNum + 1}` })))
    }
    await Promise.all(tasks)
    return list
  }
}
