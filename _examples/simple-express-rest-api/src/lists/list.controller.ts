import { Uuid } from '@dandi/common'
import { Inject } from '@dandi/core'
import { HttpHeader, MimeType, MimeTypeInfo, NotFoundError } from '@dandi/http'
import { PathParam, RequestBody, RequestHeader } from '@dandi/http-model'
import { Controller, Cors, HttpDelete, HttpGet, HttpPost, HttpPut } from '@dandi/mvc'
import { AccessorResourceId, ResourceAccessor, ResourceListAccessor } from '@dandi/mvc-hal'
import { View, ViewResult, ViewResultFactory } from '@dandi/mvc-view'

import { TaskRequest } from '../tasks/task'
import { TaskResource } from '../tasks/task.relations'

import { List, ListRequest } from './list'
import { ListManager } from './list.manager'
import { ListResource } from './list.relations'

@Controller('/list')
@Cors()
export class ListController {
  constructor(
    @Inject(ListManager) private listManager: ListManager,
    @Inject(ViewResultFactory) private view: ViewResultFactory,
  ) {}

  @HttpGet()
  @ResourceListAccessor(ListResource)
  @View()
  public async getAllLists(@RequestHeader(HttpHeader.accept) mimeTypes: MimeTypeInfo[]): Promise<ListResource[] | ViewResult> {
    const result = (await this.listManager.getAllLists()).map((list) => new ListResource(list))

    if (mimeTypes.some(type => type.fullType === MimeType.textHtmlPartial)) {
      return this.view('list-index.pug', result)
    }
    if (mimeTypes.some(type => type.fullType === MimeType.textHtml)) {
      return this.view('index.pug', result)
    }
  }

  @HttpPost()
  @View()
  public async addList(@RequestBody(ListRequest) listRequest, @RequestHeader(HttpHeader.accept) mimeTypes: MimeTypeInfo[]): Promise<ListResource | ViewResult> {
    const resource = new ListResource(await this.listManager.addList(listRequest))

    if (mimeTypes.some(type => type.fullType === MimeType.textHtmlPartial)) {
      return this.view('list-partial.pug', resource)
    }
    if (mimeTypes.some(type => type.fullType === MimeType.textHtml)) {
      return this.view('list-detail.pug', resource)
    }

    return resource
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
  @View('list.pug')
  public async getList(
    @PathParam(Uuid)
    @AccessorResourceId()
      listId: Uuid,
  ): Promise<ListResource> {
    const list = await this.listManager.getList(listId)
    if (!list) {
      throw new NotFoundError()
    }
    return new ListResource(list)
  }

  @HttpDelete(':listId')
  @View('list-delete.pug')
  public async deleteList(@PathParam(Uuid) listId: Uuid): Promise<List> {
    const list = await this.listManager.deleteList(listId)
    if (!list) {
      throw new NotFoundError()
    }
    return new ListResource(list)
  }

  @HttpGet(':listId/task')
  @ResourceListAccessor(TaskResource)
  @View('../tasks/index.pug')
  public async listTasks(
    @PathParam(Uuid)
    @AccessorResourceId(List)
      listId: Uuid,
  ): Promise<TaskResource[]> {
    return (await this.listManager.getAllTasks(listId)).map(task => new TaskResource(task))
  }

  @HttpPost(':listId/task')
  @View('../tasks/task-partial.pug')
  public async addTask(@PathParam(Uuid) listId, @RequestBody(TaskRequest) taskRequest): Promise<TaskResource> {
    return new TaskResource(await this.listManager.addTask(listId, taskRequest))
  }
}
