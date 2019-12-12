import { SinonStubbedInstance, SinonStubbedMember, stub } from 'sinon'

export function createStubObject<TInstance>(...names: (keyof TInstance)[]): SinonStubbedInstance<TInstance> {
  return names.reduce((instance: SinonStubbedInstance<TInstance>, propName: keyof TInstance) => {
    instance[propName] = stub() as SinonStubbedMember<TInstance[keyof TInstance]>
    return instance
  }, {} as SinonStubbedInstance <TInstance>)
}
