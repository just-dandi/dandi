import { ListRelation } from '@dandi/hal';

import { Task } from '../tasks/task';

import { List } from './list';

export class ListResource extends List {
  constructor(source?: any) {
    super(source);
  }

  @ListRelation(Task)
  public tasks: Task[];
}
