## Describing Dependencies

Use the [[@Inject()]] decorator to describe dependencies in a constructor:

```typescript
@Injectable()
class ServiceA {

  public getSomething(): Promise<Something> {
    ...
  }

}

@Injectable()
class ServiceB {

  constructor(
    @Inject(ServiceA) private serviceA: ServiceA,
  ) {}

  public async doSomething(): Promise<void> {
    const something = await this.serviceA.getSomething()
    console.log(something)
  }

}
```

The [[@Inject()]] decorator can also be used to describe dependencies for
a method. While Dandi does not automatically wrap method
calls, decorated method can be invoked by the [[Injector.invoke]] method:

```typescript
@Injectable()
class MyService {
  
  constructor(@Inject(Injector) private injector: Injector) {}
  
  public async doSomething(): Promise<void> {
    await this.injector.invoke(this, 'invokableMethod') // returns a Promise
  }
  
  public invokableMethod(@Inject(MyDependency) myDep: MyDependency): void {
  }
} 

```

### Optional Dependencies

Dependencies can be marked as option using the [[@Optional()]] decorator.
Optional dependencies that cannot be resolved will be passed as `undefined`.

```typescript
class MyService {
  constructor(
    @Inject(MyDependency)
    @Optional()
    private myDep: MyDependency,
  ) {}
}
```
