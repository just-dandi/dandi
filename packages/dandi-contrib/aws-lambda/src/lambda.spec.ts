// import { Provider } from '@dandi/core'
// import { TestHarness, stubProvider, testHarness } from '@dandi/core/testing'
// import { HttpPipeline } from '@dandi/http-pipeline'
// import { Context } from 'aws-lambda'
// import { expect } from 'chai'
// import { SinonStubbedInstance, createStubInstance, spy, stub } from 'sinon'
//
// import { MockContext } from '../test'
//
// import { HandlerFn, Lambda } from './lambda'
// import { LambdaEventTransformer } from './lambda-event-transformer'
// import { LambdaHandler } from './lambda-handler'
//
// interface TestEvent {}
//
// interface TestResponse {}
//
// class TestTransformer implements LambdaEventTransformer<TestEvent> {
//   public transform(): Provider<any>[] {
//     return []
//   }
// }
//
// describe('Lambda', () => {
//   TestHarness.scopeGlobalRepository()
//
//   class TestHandler implements LambdaHandler {
//     public static instance: SinonStubbedInstance<LambdaHandler>
//
//     constructor() {
//       stub(this, 'handleEvent').callsFake(() => {
//         return Promise.resolve(response)
//       })
//       TestHandler.instance = this as any
//     }
//
//     public handleEvent(): Promise<any> {
//       return undefined
//     }
//   }
//
//   let event: TestEvent
//   let scope: Context
//   let response: TestResponse
//   let handlerFn: HandlerFn<TestEvent, any>
//
//   let transformer: SinonStubbedInstance<LambdaEventTransformer<TestEvent>>
//
//   beforeEach(async () => {
//     event = {}
//     scope = createStubInstance(MockContext) as unknown as Context
//     response = {}
//   })
//   afterEach(() => {
//     event = undefined
//     scope = undefined
//     response = undefined
//
//     handlerFn = undefined
//     transformer = undefined
//     responder = undefined
//   })
//
//   describe('standalone (no existing application)', () => {
//     // note: this is the way Lambda will be used in the wild, but there's no way to access the rootInjector
//     // when it uses its own application instance. This test only ensures that the call goes all the way through.
//     // The rest of the functionality is tested elsewhere in this suite.
//
//     beforeEach(async () => {
//       handlerFn = Lambda.handler(
//         TestHandler,
//         Lambda,
//         stubProvider(TestHandler),
//         stubProvider(TestTransformer, LambdaEventTransformer),
//         stubProvider(TestResponder, LambdaResponder),
//         stubProvider(HttpPipeline),
//       )
//     })
//
//     it('can create a Lambda instance', async () => {
//       await expect(handlerFn(event, scope)).to.be.fulfilled
//     })
//
//     it('uses the same instance in subsequent calls', async () => {
//       const handleEvent = spy(Lambda.prototype, 'handleEvent')
//
//       await handlerFn(event, scope)
//       await handlerFn(event, scope)
//
//       expect(handleEvent).to.have.been.calledTwice
//       expect(handleEvent.firstCall.thisValue).to.equal(handleEvent.secondCall.thisValue)
//     })
//   })
//
//   describe('basic usage', () => {
//     const harness = testHarness(
//       Lambda,
//       stubProvider(TestHandler),
//       stubProvider(TestTransformer, LambdaEventTransformer),
//       stubProvider(TestResponder, LambdaResponder),
//       stubProvider(HttpPipeline),
//     )
//
//     beforeEach(async () => {
//       handlerFn = Lambda.handler(TestHandler, harness.rootInjector)
//
//       transformer = await harness.injectStub(LambdaEventTransformer)
//       transformer.transform.returns([])
//     })
//
//     describe('handler', () => {
//       it('generates a handler function', async () => {
//         expect(handlerFn).to.exist
//       })
//
//       it('can create a Lambda instance', async () => {
//         await expect(handlerFn(event, scope)).to.be.fulfilled
//       })
//     })
//
//     describe('handleEvent', () => {
//       let transformProviders: Provider<any>[]
//
//       beforeEach(async () => {
//         transformer = await harness.injectStub(LambdaEventTransformer)
//         transformProviders = []
//         transformer.transform.returns(transformProviders)
//         spy(harness.rootInjector, 'invoke')
//
//         await handlerFn(event, scope)
//
//         responder = await harness.injectStub(LambdaResponder)
//       })
//       afterEach(() => {
//         transformProviders = undefined
//       })
//
//       it('calls the event transformer with the passed event and scope', async () => {
//         expect(transformer.transform).to.have.been.calledOnce.calledWithExactly(event, scope)
//       })
//
//       it('passes the result of the event transformer to the handler', async () => {
//         const pipeline = await harness.inject(HttpPipeline)
//         expect(harness.rootInjector.invoke).to.have.been
//           .calledOnce
//           .calledWith(pipeline, 'handleRequest')
//
//         // const passedProviders = harness.invoke()
//         // expect(TestHandler.instance.handleEvent).to.have.been.calledOnce.calledWithExactly(transformProviders, scope)
//       })
//
//       it('passes the result of the handler to the responder', () => {
//         expect(responder.handleResponse).to.have.been.calledOnce.calledWithExactly(response)
//       })
//
//       describe('errors', () => {
//         let error: Error
//
//         beforeEach(async () => {
//           error = new Error('Your llama is lloose!')
//           responder.handleResponse.throws(error)
//
//           handlerFn = Lambda.handler(TestHandler, harness.rootInjector)
//
//           await handlerFn(event, scope)
//         })
//         afterEach(() => {
//           error = undefined
//         })
//
//         it("calls the responder's handleError method with the error", () => {
//           expect(responder.handleError).to.have.been.calledOnce.calledWithExactly(error)
//         })
//       })
//     })
//   })
//
//   describe('error handlers', () => {
//     class TestErrorHandler implements LambdaErrorHandler<TestEvent> {
//       public handleError(): void {}
//     }
//
//     const harness = testHarness(
//       Lambda,
//       stubProvider(TestHandler),
//       stubProvider(TestTransformer, LambdaEventTransformer),
//       stubProvider(TestResponder, LambdaResponder),
//       stubProvider(TestErrorHandler, LambdaErrorHandler),
//       stubProvider(HttpPipeline),
//     )
//
//     let error: Error
//     let errorHandler: SinonStubbedInstance<LambdaErrorHandler<TestEvent>>
//
//     beforeEach(async () => {
//       responder = await harness.injectStub(LambdaResponder)
//
//       transformer = await harness.injectStub(LambdaEventTransformer)
//       transformer.transform.returns([])
//
//       error = new Error('Your llama is lloose!')
//       responder.handleResponse.throws(error)
//
//       errorHandler = (await harness.injectStub(LambdaErrorHandler))[0]
//
//       handlerFn = Lambda.handler(TestHandler, harness.rootInjector)
//
//       await handlerFn(event, scope)
//     })
//     afterEach(() => {
//       error = undefined
//       errorHandler = undefined
//     })
//
//     it('calls any error handlers with the error and original event', () => {
//       expect(errorHandler.handleError).to.have.been.calledOnce.calledWithExactly(event, error)
//     })
//   })
// })
