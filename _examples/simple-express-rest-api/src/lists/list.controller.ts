import { Uuid } from '@dandi/common'
import { Inject } from '@dandi/core'
import { PathParam, RequestBody } from '@dandi/http-model'
import { Controller, Cors, HttpGet, HttpPost, HttpPut } from '@dandi/mvc'
import { AccessorResourceId, ResourceAccessor, ResourceListAccessor } from '@dandi/mvc-hal'

import { Task, TaskRequest } from '../tasks/task'

import { List, ListRequest } from './list'
import { ListManager } from './list.manager'
import { ListResource } from './list.resource'

@Controller('/list')
@Cors()
export class ListController {
  constructor(@Inject(ListManager) private listManager: ListManager) {}

  @HttpGet()
  @ResourceListAccessor(ListResource)
  public async getAllLists(): Promise<ListResource[]> {
    return (await this.listManager.getAllLists()).map((list) => new ListResource(list))
  }

  @HttpPost()
  public async addList(@RequestBody(ListRequest) listRequest): Promise<ListResource> {
    return new ListResource(await this.listManager.addList(listRequest))
  }

  @HttpPut()
  @Cors({
    allowOrigin: ['this-should-never-get accessed-via-cors'],
  })
  public async putList(@RequestBody(ListRequest) listRequest): Promise<ListResource> {
    return new ListResource(await this.listManager.addList(listRequest))
  }

  @HttpGet(':listId')
  @ResourceAccessor(ListResource)
  public async getList(
    @PathParam(Uuid)
    @AccessorResourceId()
      listId: Uuid,
  ): Promise<ListResource> {
    return new ListResource(await this.listManager.getList(listId))
  }

  @HttpGet(':listId/task')
  @ResourceListAccessor(Task)
  public listTasks(
    @PathParam(Uuid)
    @AccessorResourceId(List)
      listId: Uuid,
  ): Promise<Task[]> {
    return this.listManager.getAllTasks(listId)
  }

  @HttpPost(':listId/task')
  public addTask(@PathParam(Uuid) listId, @RequestBody(TaskRequest) taskRequest): Promise<Task> {
    return this.listManager.addTask(listId, taskRequest)
  }
}
