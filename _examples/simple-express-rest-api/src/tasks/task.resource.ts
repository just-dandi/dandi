import { Relation } from '@dandi/hal'

import { ListResource } from '../lists/list.resource'

import { Task } from './task'

export class TaskResource extends Task {
  constructor(source?: any) {
    super(source)
  }

  public list: ListResource
}
