# @dandi/mvc-hal

`@dandi/mvc-hal` provides services for emitting
[HAL](http://stateless.co/hal_specification.html) JSON
(`application/hal+json`) from `@dandi/mvc` controllers.

## Usage

To use the HAL services from `@dandi/mvc-hal`, add the `MvcHalModule` to
your server container.

- `HalResultTransformer` will intercept the value returned by controller
  methods and attempt to compose it into a HAL resource.

- `DefaultResourceComposer` is the default composer used by
  `HalResultTransformer`, and will automatically add a link for the `self`
  relation, add any other relations specified by the `@Relation()` or
  `@ListRelation()` decorators, and embed any relations specified on the
  request by the `_embedded` querystring param.

## Decorators

Relations between resources, as well as resource identifiers, are
defined using decorators.

### Defining a Resource

Use `@ResourceId()` to define the identifier property on a resource:

```typescript
export class TaskList {
  @ResourceId()
  @Property(Uuid)
  @Required()
  public listId: Uuid;
}
```

The `@ResourceId()` decorator on the resource model must correspond with
a `@ResourceAccessor()` decorator, which is applied to the controller
method used to get that resource, and a `@ResourceId()` decorator on the
parameter specifying the model's ID:

```typescript
@Controller('/list')
export class TaskListController {

  @HttpGet(':listId')
  @ResourceAccessor(TaskList)
  public getList(@PathParam(Uuid) @ResourceId() listId: Uuid): Promise<TaskList> {
    ...
  }

}
```

The `@ResourceId()` decorator on the `listId` parameter will be linked
to the `listId` property on the `TaskList` model since the
`@ResourceAccessor()` decorator specifies `TaskList` as its type, and
`listId` is defined as its ID property by its own `@ResourceId()`
decorator.

Controller methods that list a resource can be identified using the
`@ResourceListAccessor()` decorator:

```typescript
@Controller('/list')
export class TaskListController {

  @HttpGet(':listId')
  @ResourceAccessor(TaskList)
  public getList(@PathParam(Uuid) listId: Uuid): Promise<TaskList> {
    ...
  }

  @HttpGet()
  @ResourceListAccessor(TaskList)
  public getAllLists(): Promise<TaskList[]> {
    ...
  }

}
```

The combination of these decorators enables the resource composer to
correctly and automatically generate the `self` relation link.

### Defining Resource Relations

The `@ResourceId()` decorator can also be used in correlation with
`@Relation` to define relations of a resource.

```typescript
export class Task {
  @Property(Uuid)
  @Required()
  @ResourceId()
  public taskId: Uuid;

  @Property(Uuid)
  @Required()
  @ResourceId(List, 'list')
  public listId: Uuid;

  @Relation(List)
  public list?: List;
}
```

The `@Relation()` decorator on the `list` property marks that property
as a relation. The `@ResourceId()` decorator on the `listId` property
describes that property as the identifier for the aforementioned `list`
relation. Assuming a `TaskController` implementation with a
corresponding `@ResourceAccessor` for the `Task` resource, these
decorators will allow the resource composer to automatically generate
links or embed resources for the `list` relation of a task.

### Avoiding Circular References with Circular Relations

Using the example of a task list, we will probably want the following
relations:

- `Task` has `list` relation to the `TaskList` it belongs to
- `TaskList` has a `tasks` relation to the array of `Task` resources
  that belong to it

Attempting to do this with one model per resource will result in
unresolvable circular dependency issues. One way to work around this is
to define the relations in separate models:

```typescript
export class TaskList {
  @ResourceId()
  @Property(Uuid)
  @Required()
  public listId: Uuid;
}

export class Task {
  @Property(Uuid)
  @Required()
  @ResourceId()
  public taskId: Uuid;

  @Property(Uuid)
  @Required()
  @ResourceId(List, 'list')
  public listId: Uuid;
}

export class TaskListResource extends TaskList {
  @ListRelation(Task)
  public tasks: Task[];
}

export class TaskResource extends Task {
  @Relation(List)
  public list?: List;
}

@Controller('/list')
export class TaskListController {

  @HttpGet(':listId')
  @ResourceAccessor(TaskListResource)
  public getList(@PathParam(Uuid) @ResourceId() listId: Uuid): Promise<TaskList> {
    ...
  }

  @HttpGet(':listId/task')
  @ResourceListAccessor(Task)
  public listTasks(@PathParam(Uuid) @ResourceId(List) listId: Uuid): Promise<Task[]> {
    ...
  }

}

@Controller('/task')
export class TaskListController {

  @HttpGet(':taskId')
  @ResourceAccessor(TaskResource)
  public getTask(@PathParam(Uuid) @ResourceId() listId: Uuid): Promise<Task> {
    ...
  }

}
```
