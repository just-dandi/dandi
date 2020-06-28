import { Disposable } from '@dandi/common'
import {
  DandiApplication,
  InjectorContextConstructor,
  Registerable,
  RootInjector,
} from '@dandi/core'
import { DandiRootInjector } from '@dandi/core/internal'
import { INJECTABLE_REGISTRATION_DATA, InjectableRegistrationData } from '@dandi/core/internal/util'

import { stub, restore } from './sandbox'
import { StubInjectorContext } from './stub-injector-context'
import { RootTestInjector, TestInjectorBase } from './test-injector'

const instances: TestHarness[] = []

export class TestHarness extends TestInjectorBase implements RootTestInjector, Disposable {

  private _application: DandiApplication
  public get application(): DandiApplication {
    return this._application
  }

  private _ready: Promise<void>
  public get ready(): Promise<void> {
    return this._ready
  }

  private rootInjector: RootInjector
  private readonly providers: Registerable[]

  constructor(providers: Registerable[], suite: boolean = true, stubMissing: boolean = false, isClone: boolean = false) {
    super(undefined, stubMissing)
    instances.push(this)

    this.providers = providers
    if (stubMissing) {
      providers.push({
        provide: InjectorContextConstructor,
        useValue: StubInjectorContext,
      })
    }

    if (suite) {
      if (!isClone) {
        this.initSandbox()
        this.stubInjectableRegistration()
      }
      this.initApplication(providers)
    } else {
      this._ready = this.setUpApplication(providers)
    }
  }

  public async single(...entries: Registerable[]): Promise<RootTestInjector> {
    const harness = new TestHarness(this.providers.concat(entries), false)
    await harness.ready
    return harness
  }

  public clone(...entries: Registerable[]): RootTestInjector {
    return new TestHarness(this.providers.concat(entries), true, false, true)
  }

  private initSandbox(): void {
    // restore the default sinon sandbox after every test
    afterEach(() => restore())
  }

  private stubInjectableRegistration(): void {
    // prevents injectables defined in tests from polluting the global registration data array
    let injectableRegistrationData: InjectableRegistrationData[]
    beforeEach(() => {
      injectableRegistrationData = []
      stub(INJECTABLE_REGISTRATION_DATA, 'push').callsFake(entry => injectableRegistrationData.push(entry))
      stub(INJECTABLE_REGISTRATION_DATA, 'forEach').callsFake(fn => injectableRegistrationData.forEach(fn))
    })
    afterEach(() => {
      injectableRegistrationData = undefined
    })
  }

  private async setUpApplication(providers: any[]): Promise<void> {
    this._application = new DandiApplication({ providers })
    this._injector = await this._application.start()
    this.rootInjector = (await this._injector.inject(DandiRootInjector)).singleValue

    this.bindInjector()
  }

  private initApplication(providers: any[]): void {
    beforeEach(async () => {
      this._ready = this.setUpApplication(providers)
      await this._ready
    })
    afterEach(async () => {
      await this.dispose()
    })
  }

  public register(...providers: Registerable[]): this {
    const source = { constructor: this.constructor }
    this.rootInjector.register(source, ...providers)
    return this
  }

  public async dispose(): Promise<void> {
    if (this._application) {
      await this._application.dispose('test complete')
      this._application = undefined
    }
    this._injector = undefined
    this._ready = undefined
  }
}

afterEach(async () => {
  await instances.map(harness => harness.dispose())
  instances.splice(0, instances.length)
})
