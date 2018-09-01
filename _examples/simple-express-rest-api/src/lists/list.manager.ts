import { Uuid } from '@dandi/common';
import { Inject, Injectable } from '@dandi/core';

import { Db } from '../shared/db';
import { Task, TaskRequest } from '../tasks/task';
import { TASK_DB_PREFIX, TaskManager } from '../tasks/task.manager';

import { ListRequest, List } from './list';

export const LIST_DB_PREFIX = 'list';

@Injectable()
export class ListManager {
  constructor(@Inject(Db) private db: Db, @Inject(TaskManager) private taskManager: TaskManager) {}

  public getList(listId: Uuid): Promise<List> {
    return this.db.get(`${LIST_DB_PREFIX}:${listId}`);
  }

  public async getAllLists(): Promise<List[]> {
    const listIds = (await this.db.get(LIST_DB_PREFIX)) as Set<Uuid>;
    if (!listIds) {
      return [];
    }
    return Promise.all(Array.from(listIds).map((listId) => this.getList(listId)));
  }

  public async getAllTasks(listId: Uuid): Promise<Task[]> {
    const taskIds = (await this.getTaskIds(listId)) || new Set<Uuid>();
    return Promise.all(Array.from(taskIds).map((taskId) => this.taskManager.getTask(taskId)));
  }

  public addList(listRequest: ListRequest): Promise<List> {
    const list = new List(listRequest);
    list.listId = Uuid.create();

    return this.putList(list);
  }

  public async putList(list: List): Promise<List> {
    let index = await this.db.get(LIST_DB_PREFIX);
    if (!index) {
      index = new Set<Uuid>();
      await this.db.set(LIST_DB_PREFIX, index);
    }
    index.add(list.listId);
    return await this.db.set(`${LIST_DB_PREFIX}:${list.listId}`, list);
  }

  public async addTask(listId: Uuid, taskRequest: TaskRequest): Promise<Task> {
    const task = new Task(taskRequest);
    task.taskId = Uuid.create();
    task.listId = listId;
    let taskList = await this.getTaskIds(listId);
    if (!taskList) {
      taskList = new Set<Uuid>();
      await this.setTaskIds(listId, taskList);
    }
    if (task.order === undefined) {
      task.order = taskList.size;
    } else {
      // TODO: update order on other tasks
    }
    const result = await this.taskManager.putTask(task);
    taskList.add(task.taskId);
    return result;
  }

  private async getTaskIds(listId: Uuid): Promise<Set<Uuid>> {
    return await this.db.get(`${LIST_DB_PREFIX}:${listId}:${TASK_DB_PREFIX}`);
  }

  private setTaskIds(listId: Uuid, taskIds: Set<Uuid>): Promise<Set<Uuid>> {
    return this.db.set(`${LIST_DB_PREFIX}:${listId}:${TASK_DB_PREFIX}`, taskIds);
  }
}
