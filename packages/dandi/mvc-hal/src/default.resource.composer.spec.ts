import { Disposable, Uuid } from '@dandi/common'
import { Provider } from '@dandi/core'
import { testHarnessSingle } from '@dandi/core/testing'
import { ComposedResource, HalModelBase, ListRelation, Relation, ResourceId, SELF_RELATION } from '@dandi/hal'
import { ModelBuilder } from '@dandi/model-builder'
import {
  Controller,
  DefaultRouteInitializer,
  HttpGet,
  HttpMethod,
  MvcRequest,
  PathParam,
  PerfRecord,
  RequestInfo,
  Route,
  Routes,
} from '@dandi/mvc'
import {
  AccessorResourceId,
  CompositionContext,
  DefaultResourceComposer,
  ResourceAccessor,
  ResourceComposer,
  ResourceListAccessor,
} from '@dandi/mvc-hal'

import { expect } from 'chai'
import { createStubInstance, stub } from 'sinon'

describe('DefaultResourceComposer', function() {

  describe('compose', function() {

    it('adds the self link on models with no other relations', async function() {
      class TestModel {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number
      }

      @Controller('/test')
      class TestController {
        @HttpGet(':id')
        @ResourceAccessor(TestModel)
        getModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModel> {
          return null
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/test/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestController,
            controllerMethod: 'getModel',
          },
        ],
      }

      const harness = await testHarnessSingle(DefaultResourceComposer, TestController, DefaultRouteInitializer, routes)
      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new TestModel(42),
        CompositionContext.for('self', '/test/42', []),
      )

      expect(result.getLink(SELF_RELATION)).to.exist
      expect(result.getLink(SELF_RELATION)).to.include({ href: '/test/42' })
    })

    it('adds self link on models with no relations and no identifier', async function() {
      class TestModel {
        constructor() {}
      }

      @Controller('/test')
      class TestController {
        @HttpGet()
        @ResourceAccessor(TestModel)
        getModel(): Promise<TestModel> {
          return null
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/test',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestController,
            controllerMethod: 'getModel',
          },
        ],
      }

      const harness = await testHarnessSingle(DefaultResourceComposer, TestController, DefaultRouteInitializer, routes)
      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new TestModel(),
        CompositionContext.for('self', '/test', []),
      )

      expect(result.getLink(SELF_RELATION)).to.exist
      expect(result.getLink(SELF_RELATION)).to.include({ href: '/test' })
    })

    it('adds self link on models with relations, but no identifier', async function() {
      class Resource {
        @ResourceId()
        resourceId: number
      }
      class Index {
        constructor() {}

        @ListRelation(Resource)
        public resources: Resource[]
      }

      @Controller('/index')
      class IndexController {
        @HttpGet()
        @ResourceAccessor(Index)
        getModel(): Promise<Index> {
          return null
        }
      }

      @Controller('/resource')
      class ResourceController {
        @ResourceListAccessor(Resource)
        @HttpGet()
        getResources() {}

        @ResourceAccessor(Resource)
        @HttpGet(':resourceId')
        getResource(
          @PathParam(Number)
          @AccessorResourceId()
            resourceId,
        ) {}
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/index',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: IndexController,
            controllerMethod: 'getModel',
          },
        ],
      }

      const harness = await testHarnessSingle(
        DefaultResourceComposer,
        IndexController,
        DefaultRouteInitializer,
        routes,
      )
      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new Index(),
        CompositionContext.for('self', '/index', []),
      )

      expect(result.getLink(SELF_RELATION)).to.exist
      expect(result.getLink(SELF_RELATION)).to.include({ href: '/index' })
    })

    it('adds links for non-array relations specified by the @Relation() decorator', async function() {
      class TestModelParent {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number
      }
      class TestModel {
        constructor(id?: number, parentId?: number) {
          this.id = id
          this.parentId = parentId
        }

        @ResourceId()
        public id: number

        @ResourceId(TestModelParent, 'parent')
        public parentId: number

        @Relation(TestModelParent)
        public parent?: TestModelParent
      }

      @Controller('/test')
      class TestController {
        @HttpGet(':id')
        @ResourceAccessor(TestModel)
        getModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModel> {
          return null
        }
      }
      @Controller('/parent')
      class TestParentController {
        @HttpGet(':id')
        @ResourceAccessor(TestModelParent)
        getModelParent(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModelParent> {
          return null
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/test/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestController,
            controllerMethod: 'getModel',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/parent/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestParentController,
            controllerMethod: 'getModelParent',
          },
        ],
      }

      const harness = await testHarnessSingle(DefaultResourceComposer, TestController, DefaultRouteInitializer, routes)
      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new TestModel(42, 7),
        CompositionContext.for('self', '/test/42', []),
      )

      expect(result.links).to.have.keys('self', 'parent')
      expect(result.getLink('self')).to.include({ href: '/test/42' })
      expect(result.getLink('parent')).to.include({ href: '/parent/7' })
    })

    it('adds links for array relations specified by the @ListRelation() decorator', async function() {
      class TestModel {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number
      }

      class TestModelParent {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number

        @ListRelation(TestModel)
        public children: TestModel[]
      }
      @Controller('/test')
      class TestController {
        @HttpGet(':id')
        @ResourceAccessor(TestModel)
        getModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModel> {
          return null
        }
      }

      @Controller('/parent')
      class TestParentController {
        @HttpGet(':id')
        @ResourceAccessor(TestModelParent)
        getModelParent(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModelParent> {
          return null
        }

        @HttpGet(':id/test-model')
        @ResourceListAccessor(TestModel)
        listChildren(
          @PathParam(Number)
          @AccessorResourceId(TestModelParent)
            id,
        ): Promise<TestModel[]> {
          return null
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/test/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestController,
            controllerMethod: 'getModel',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/parent/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestParentController,
            controllerMethod: 'getModelParent',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/parent/:id/test-model',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestParentController,
            controllerMethod: 'listChildren',
          },
        ],
      }

      const harness = await testHarnessSingle(DefaultResourceComposer, TestController, DefaultRouteInitializer, routes)
      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new TestModelParent(42),
        CompositionContext.for('self', '/parent/42', []),
      )

      expect(result.links).to.have.keys('self', 'children')
      expect(result.getLink('self')).to.include({ href: '/parent/42' })
      expect(result.getLink('children')).to.include({ href: '/parent/42/test-model' })
    })

    it('embeds links for non-array relations', async function() {
      class TestModelParent {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number
      }

      class TestModel {
        constructor(id?: number, parentId?: number) {
          this.id = id
          this.parentId = parentId
        }

        @ResourceId()
        public id: number

        @ResourceId(TestModelParent, 'parent')
        public parentId: number

        @Relation(TestModelParent)
        public parent?: TestModelParent
      }

      @Controller('/test')
      class TestController {
        @HttpGet(':id')
        @ResourceAccessor(TestModel)
        getModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModel> {
          return null
        }
      }

      @Controller('/parent')
      class TestParentController {
        @HttpGet(':id')
        @ResourceAccessor(TestModelParent)
        getModelParent(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModelParent> {
          return Promise.resolve(new TestModelParent(id))
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/test/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestController,
            controllerMethod: 'getModel',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/parent/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestParentController,
            controllerMethod: 'getModelParent',
          },
        ],
      }

      const request: Provider<MvcRequest> = {
        provide: MvcRequest,
        useValue: {
          body: null,
          params: {},
          path: '/test/42',
          query: {},
          method: HttpMethod.get,
          get(key: string) {
            return null
          },
        },
      }

      const requestInfo: Provider<RequestInfo> = {
        provide: RequestInfo,
        useValue: {
          requestId: Uuid.create(),
          performance: createStubInstance(PerfRecord),
        },
      }

      const harness = await testHarnessSingle(
        DefaultResourceComposer,
        TestController,
        DefaultRouteInitializer,
        routes,
        request,
        requestInfo,
        {
          provide: ModelBuilder,
          useValue: {
            constructModel: stub().returnsArg(1),
            constructMember: stub().returnsArg(2),
          },
        },
      )
      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new TestModel(42, 7),
        CompositionContext.for('self', 'test/42', ['parent']),
      )

      expect(result.embedded).to.have.keys('parent')
      const embeddedParent = result.getEmbedded('parent') as ComposedResource<any>
      expect(embeddedParent).to.exist
      expect(embeddedParent).to.be.instanceOf(ComposedResource)
      expect(embeddedParent.entity).to.be.instanceOf(TestModelParent)
      expect(embeddedParent.entity.id).to.equal(7)

    })

    it('embeds links for array relations', async function() {
      class TestModel {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number
      }

      class TestModelParent {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number

        @ListRelation(TestModel)
        public children: TestModel[]
      }

      @Controller('/test')
      class TestController {
        @HttpGet(':id')
        @ResourceAccessor(TestModel)
        getModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModel> {
          return null
        }
      }

      @Controller('/parent')
      class TestParentController {
        @HttpGet(':id')
        @ResourceAccessor(TestModelParent)
        getModelParent(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModelParent> {
          return null
        }

        @HttpGet(':id/test-model')
        @ResourceListAccessor(TestModel)
        listChildren(
          @PathParam(Number)
          @AccessorResourceId(TestModelParent)
            id,
        ): Promise<TestModel[]> {
          return Promise.resolve([
            new TestModel(1),
            new TestModel(2),
            new TestModel(3),
            new TestModel(5),
            new TestModel(8),
            new TestModel(13),
          ])
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/test/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestController,
            controllerMethod: 'getModel',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/parent/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestParentController,
            controllerMethod: 'getModelParent',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/parent/:id/test-model',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestParentController,
            controllerMethod: 'listChildren',
          },
        ],
      }
      const request: Provider<MvcRequest> = {
        provide: MvcRequest,
        useValue: {
          body: null,
          params: {},
          path: '/test/42',
          query: {},
          method: HttpMethod.get,
          get(key: string) {
            return null
          },
        },
      }

      const requestInfo: Provider<RequestInfo> = {
        provide: RequestInfo,
        useValue: {
          requestId: Uuid.create(),
          performance: createStubInstance(PerfRecord),
        },
      }

      const harness = await testHarnessSingle(
        DefaultResourceComposer,
        TestController,
        DefaultRouteInitializer,
        routes,
        request,
        requestInfo,
        {
          provide: ModelBuilder,
          useValue: {
            constructModel: stub().returnsArg(1),
            constructMember: stub().returnsArg(2),
          },
        },
      )

      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new TestModelParent(42),
        CompositionContext.for('self', '/test/42', ['children']),
      )

      expect(result.embedded).to.have.keys('children')
      const embeddedChildren = result.getEmbedded('children') as ComposedResource<TestModel>[]
      expect(embeddedChildren).to.exist
      expect(embeddedChildren).to.be.instanceOf(Array)
      embeddedChildren.forEach((child) => {
        expect(child).to.be.instanceOf(ComposedResource)
        expect(child.entity).to.be.instanceOf(TestModel)
      })
      expect(embeddedChildren.map((child) => child.entity)).to.deep.equal([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 5 },
        { id: 8 },
        { id: 13 },
      ])
    })

    it('embeds nested links for non-array relations', async function() {
      class LevelOneModel {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number
      }

      class LevelTwoModel {
        constructor(id?: number, parentId?: number) {
          this.id = id
          this.parentId = parentId
        }

        @ResourceId()
        public id: number

        @ResourceId(LevelOneModel, 'parent')
        public parentId: number

        @Relation(LevelOneModel)
        public parent?: LevelOneModel
      }

      class LevelThreeModel {
        constructor(id?: number, parentId?: number) {
          this.id = id
          this.parentId = parentId
        }

        @ResourceId()
        public id: number

        @ResourceId(LevelTwoModel, 'parent')
        public parentId: number

        @Relation(LevelTwoModel)
        public parent?: LevelTwoModel
      }

      @Controller('/level-one')
      class LevelOneController {
        @HttpGet(':id')
        @ResourceAccessor(LevelOneModel)
        async getLevelOneModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<LevelOneModel> {
          return new LevelOneModel(id)
        }
      }

      @Controller('/level-two')
      class LevelTwoController {
        @HttpGet(':id')
        @ResourceAccessor(LevelTwoModel)
        async getLevelTwoModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<LevelTwoModel> {
          return new LevelTwoModel(id, id * 2)
        }
      }

      @Controller('/level-three')
      class LevelThreeController {
        @HttpGet(':id')
        @ResourceAccessor(LevelThreeModel)
        async getLevelThreeModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<LevelThreeModel> {
          return new LevelThreeModel(id, id * 2)
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/level-one/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: LevelOneController,
            controllerMethod: 'getLevelOneModel',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/level-two/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: LevelTwoController,
            controllerMethod: 'getLevelTwoModel',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/level-three/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: LevelThreeController,
            controllerMethod: 'getLevelThreeModel',
          },
        ],
      }

      const request: Provider<MvcRequest> = {
        provide: MvcRequest,
        useValue: {
          body: null,
          params: {},
          path: '/test/42',
          query: {},
          method: HttpMethod.get,
          get(key: string) {
            return null
          },
        },
      }

      const requestInfo: Provider<RequestInfo> = {
        provide: RequestInfo,
        useValue: {
          requestId: Uuid.create(),
          performance: createStubInstance(PerfRecord),
        },
      }

      const harness = await testHarnessSingle(
        DefaultResourceComposer,
        LevelOneController,
        LevelTwoController,
        LevelThreeController,
        DefaultRouteInitializer,
        routes,
        request,
        requestInfo,
        {
          provide: ModelBuilder,
          useValue: {
            constructModel: stub().returnsArg(1),
            constructMember: stub().returnsArg(2),
          },
        },
      )

      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new LevelThreeModel(21, 42),
        CompositionContext.for('self', '/level-three/21', ['parent.parent']),
      )

      expect(result.embedded).to.have.keys('parent')
      const embeddedParent = result.getEmbedded('parent') as ComposedResource<any>
      expect(embeddedParent).to.exist
      expect(embeddedParent).to.be.instanceOf(ComposedResource)
      expect(embeddedParent.entity).to.be.instanceOf(LevelTwoModel)
      expect(embeddedParent.entity.id).to.equal(42)
      const embeddedRoot = embeddedParent.getEmbedded('parent') as ComposedResource<any>
      expect(embeddedRoot).to.exist
      expect(embeddedRoot).to.be.instanceOf(ComposedResource)
      expect(embeddedRoot.entity).to.be.instanceOf(LevelOneModel)
      expect(embeddedRoot.entity.id).to.equal(84)
    })

    it('embeds nested links for array relations', async function() {
      class OtherModel {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number
      }

      class TestModel {
        constructor(id?: number, otherId?: number) {
          this.id = id
          this.otherId = otherId
        }

        @ResourceId()
        public id: number

        @ResourceId(OtherModel, 'other')
        public otherId: number

        @Relation(OtherModel)
        public other: OtherModel
      }

      class TestModelParent {
        constructor(id?: number) {
          this.id = id
        }

        @ResourceId()
        public id: number

        @ListRelation(TestModel)
        public children: TestModel[]
      }

      @Controller('/other')
      class OtherController {
        @HttpGet(':id')
        @ResourceAccessor(OtherModel)
        async getOther(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<OtherModel> {
          return new OtherModel(id)
        }
      }

      @Controller('/test')
      class TestController {
        @HttpGet(':id')
        @ResourceAccessor(TestModel)
        async getModel(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModel> {
          return new TestModel(id, id * 2)
        }
      }

      @Controller('/parent')
      class TestParentController {
        @HttpGet(':id')
        @ResourceAccessor(TestModelParent)
        async getModelParent(
          @PathParam(Number)
          @AccessorResourceId()
            id,
        ): Promise<TestModelParent> {
          return new TestModelParent(id)
        }

        @HttpGet(':id/test-model')
        @ResourceListAccessor(TestModel)
        listChildren(
          @PathParam(Number)
          @AccessorResourceId(TestModelParent)
            id,
        ): Promise<TestModel[]> {
          return Promise.resolve([
            new TestModel(1, 2),
            new TestModel(2, 4),
            new TestModel(3, 6),
            new TestModel(5, 10),
            new TestModel(8, 16),
            new TestModel(13, 26),
          ])
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/test/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestController,
            controllerMethod: 'getModel',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/parent/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestParentController,
            controllerMethod: 'getModelParent',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/parent/:id/test-model',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: TestParentController,
            controllerMethod: 'listChildren',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/other/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: OtherController,
            controllerMethod: 'getOther',
          },
        ],
      }
      const request: Provider<MvcRequest> = {
        provide: MvcRequest,
        useValue: {
          body: null,
          params: {},
          path: '/parent/42/test-model',
          query: {},
          method: HttpMethod.get,
          get(key: string) {
            return null
          },
        },
      }

      const requestInfo: Provider<RequestInfo> = {
        provide: RequestInfo,
        useValue: {
          requestId: Uuid.create(),
          performance: createStubInstance(PerfRecord),
        },
      }

      const harness = await testHarnessSingle(
        DefaultResourceComposer,
        TestController,
        DefaultRouteInitializer,
        routes,
        request,
        requestInfo,
        {
          provide: ModelBuilder,
          useValue: {
            constructModel: stub().returnsArg(1),
            constructMember: stub().returnsArg(2),
          },
        },
      )
      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new TestModelParent(42),
        CompositionContext.for('self', '/parent/42/test-model', ['children.other']),
      )

      expect(result.embedded).to.have.keys('children')
      const embeddedChildren = result.getEmbedded('children') as ComposedResource<TestModel>[]
      expect(embeddedChildren).to.exist
      expect(embeddedChildren).to.be.instanceOf(Array)
      embeddedChildren.forEach((child) => {
        expect(child).to.be.instanceOf(ComposedResource)
        expect(child.entity).to.be.instanceOf(TestModel)
      })
      expect(embeddedChildren.map((child) => child.entity)).to.deep.equal([
        { id: 1, otherId: 2 },
        { id: 2, otherId: 4 },
        { id: 3, otherId: 6 },
        { id: 5, otherId: 10 },
        { id: 8, otherId: 16 },
        { id: 13, otherId: 26 },
      ])
      embeddedChildren.forEach((child) => {
        const embeddedOther = child.getEmbedded('other') as ComposedResource<OtherModel>
        expect(embeddedOther).to.exist
        expect(embeddedOther.entity).to.be.instanceOf(OtherModel)
        expect(embeddedOther.entity.id).to.equal(child.entity.otherId)
      })
    })

    it('embeds nested links for array relations on an index model', async function() {
      class Item extends HalModelBase {
        constructor(source?: any) {
          super(source)
        }

        @ResourceId()
        public itemId: number
      }

      class List extends HalModelBase {
        constructor(source?: any) {
          super(source)
        }

        @ResourceId()
        public listId: number

        @ListRelation(Item)
        public items: Item[]
      }

      class Me extends HalModelBase {
        constructor(source?: any) {
          super(source)
        }

        @ListRelation(List)
        public lists: List[]
      }

      @Controller('/list')
      class ListController {
        @HttpGet()
        @ResourceListAccessor(List)
        async getLists(): Promise<List[]> {
          return [
            new List({ listId: Math.random() }),
            new List({ listId: Math.random() }),
            new List({ listId: Math.random() }),
          ]
        }

        @HttpGet('/:listId')
        @ResourceAccessor(List)
        async getList(
          @PathParam(Number)
          @AccessorResourceId()
            listId,
        ) {
          return new List({ listId })
        }

        @HttpGet('/:listId/item')
        @ResourceListAccessor(Item)
        async getListItems(
          @PathParam(Number)
          @AccessorResourceId(List)
            listId,
        ) {
          return [
            new Item({ listId, itemId: Math.random() }),
            new Item({ listId, itemId: Math.random() }),
            new Item({ listId, itemId: Math.random() }),
          ]
        }
      }

      @Controller('/me')
      class MeController {
        @HttpGet()
        @ResourceAccessor(Me)
        async getMe(): Promise<Me> {
          return new Me()
        }
      }

      @Controller('/item')
      class ItemController {
        @HttpGet(':itemId')
        @ResourceAccessor(Item)
        async getItem(
          @PathParam(Number)
          @AccessorResourceId()
            itemId,
        ): Promise<Item> {
          return new Item({ itemId })
        }
      }

      const routes: Provider<Route[]> = {
        provide: Routes,
        useValue: [
          {
            httpMethod: HttpMethod.get,
            path: '/list',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: ListController,
            controllerMethod: 'getLists',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/list/:listId',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: ListController,
            controllerMethod: 'getList',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/list/:listId/item',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: ListController,
            controllerMethod: 'getListItems',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/me',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: MeController,
            controllerMethod: 'getMe',
          },
          {
            httpMethod: HttpMethod.get,
            path: '/item/:id',
            siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
            controllerCtr: ItemController,
            controllerMethod: 'getItem',
          },
        ],
      }
      const request: Provider<MvcRequest> = {
        provide: MvcRequest,
        useValue: {
          body: null,
          params: {},
          path: '/parent/42/test-model',
          query: {},
          method: HttpMethod.get,
          get(key: string) {
            return null
          },
        },
      }

      const requestInfo: Provider<RequestInfo> = {
        provide: RequestInfo,
        useValue: {
          requestId: Uuid.create(),
          performance: createStubInstance(PerfRecord),
        },
      }

      const harness = await testHarnessSingle(
        DefaultResourceComposer,
        MeController,
        DefaultRouteInitializer,
        routes,
        request,
        requestInfo,
        {
          provide: ModelBuilder,
          useValue: {
            constructModel: stub().returnsArg(1),
            constructMember: stub().returnsArg(2),
          },
        },
      )
      const composer = await harness.inject(ResourceComposer)
      const result = await composer.compose(
        new Me(),
        CompositionContext.for('self', '/me', ['lists.items']),
      )

      expect(result.embedded).to.have.keys('lists')
      const embeddedLists = result.getEmbedded('lists') as ComposedResource<List>[]
      expect(embeddedLists).to.exist
      expect(embeddedLists).to.be.instanceOf(Array)
      embeddedLists.forEach((list) => {
        expect(list).to.be.instanceOf(ComposedResource)
        expect(list.entity).to.be.instanceOf(List)
      })
      // expect(embeddedLists.map((child) => child.entity)).to.deep.equal([
      //   { id: 1, otherId: 2 },
      //   { id: 2, otherId: 4 },
      //   { id: 3, otherId: 6 },
      //   { id: 5, otherId: 10 },
      //   { id: 8, otherId: 16 },
      //   { id: 13, otherId: 26 },
      // ]);
      // embeddedLists.forEach((child) => {
      //   const embeddedOther = child.getEmbedded('other') as ComposedResource<List>;
      //   expect(embeddedOther).to.exist;
      //   expect(embeddedOther.entity).to.be.instanceOf(List);
      //   expect(embeddedOther.entity.listId).to.equal(child.entity.otherId);
      // });
    })
  })
})
