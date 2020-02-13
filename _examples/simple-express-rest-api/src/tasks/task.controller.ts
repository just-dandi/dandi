import { Uuid } from '@dandi/common'
import { Inject } from '@dandi/core'
import { HttpHeader, MimeType, MimeTypeInfo, NotFoundError } from '@dandi/http'
import { PathParam, RequestBody, RequestHeader } from '@dandi/http-model'
import { Controller, HttpDelete, HttpGet, HttpPatch } from '@dandi/mvc'
import { AccessorResourceId, ResourceAccessor } from '@dandi/mvc-hal'
import { View, ViewResultFactory, ViewResult } from '@dandi/mvc-view'

import { ListManager } from '../lists/list.manager'

import { Task } from './task'
import { TaskManager } from './task.manager'
import { TaskResource } from './task.resource'

@Controller('/task')
export class TaskController {
  constructor(
    @Inject(ListManager) private listManager: ListManager,
    @Inject(TaskManager) private taskManager: TaskManager,
    @Inject(ViewResultFactory) private view: ViewResultFactory,
  ) {}

  @HttpGet(':taskId')
  @ResourceAccessor(TaskResource)
  @View()
  public async getTask(
    @PathParam(Uuid) @AccessorResourceId() taskId: Uuid,
    @RequestHeader(HttpHeader.accept) mimeTypes: MimeTypeInfo[],
  ): Promise<ViewResult | TaskResource> {
    const resource = new TaskResource(await this.taskManager.getTask(taskId))

    if (mimeTypes.some(type => type.fullType === MimeType.textHtmlPartial)) {
      return this.view('task-partial.pug', resource)
    }
    if (mimeTypes.some(type => type.fullType === MimeType.textHtml)) {
      return this.view('task-detail.pug', resource)
    }

    return resource
  }

  @HttpPatch(':taskId')
  @View('task-partial.pug')
  public async updateTask(@PathParam(Uuid) taskId, @RequestBody(Task) task): Promise<TaskResource> {
    if (taskId !== task.taskId) {
      throw new Error('taskId on path did not match taskId on model')
    }

    const existingTask = await this.taskManager.getTask(taskId)
    Object.assign(existingTask, task)

    return new TaskResource(existingTask)
  }

  @HttpDelete(':taskId')
  @View('task-delete.pug')
  public async deleteTask(@PathParam(Uuid) taskId): Promise<TaskResource> {
    const result = await this.listManager.deleteTask(taskId)
    if (!result) {
      throw new NotFoundError()
    }
    return new TaskResource(result)
  }
}
