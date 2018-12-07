import { Logger, NoopLogger, Repository } from '@dandi/core'
import {
  Authorized,
  Controller,
  Cors,
  DecoratorRouteGenerator,
  HttpDelete,
  HttpGet,
  HttpMethod,
  HttpPost,
  HttpPut,
  IsAuthorized,
  Route,
} from '@dandi/mvc'
import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance } from 'sinon'

@Controller('/decorator-route-generator/a')
@Cors()
class TestControllerA {
  @HttpGet('testA')
  @HttpPost('/testA')
  public testMethod() {}
}
@Controller('/decorator-route-generator/b')
@Cors({})
class TestControllerB {
  @HttpPut('testB')
  public testMethod() {}
}
@Controller('decorator-route-generator/c')
@Authorized()
class TestControllerC {
  @HttpDelete('testC')
  @Cors()
  public testMethod() {}
}
@Controller('/decorator-route-generator/d/')
class TestControllerD {
  @HttpGet('/testD')
  @Authorized()
  @Cors({})
  public testMethod() {}
}

describe('DecoratorRouteGenerator', () => {
  let logger: SinonStubbedInstance<Logger>
  let generator: DecoratorRouteGenerator
  let repository: Repository
  let routes: Route[]
  let aGet: Route
  let aPost: Route
  let bPut: Route
  let cDelete: Route
  let dGet: Route

  function findRoute(path, httpMethod): Route {
    return routes.find(
      (route) => route.path === `/decorator-route-generator${path}` && route.httpMethod === httpMethod,
    )
  }

  beforeEach(() => {
    logger = createStubInstance(NoopLogger)
    generator = new DecoratorRouteGenerator(logger)
    repository = Repository.for(Controller)

    routes = generator.generateRoutes().filter((route: Route) => route.path.startsWith('/decorator-route-generator/'))
    aGet = findRoute('/a/testA', HttpMethod.get)
    aPost = findRoute('/a/testA', HttpMethod.post)
    bPut = findRoute('/b/testB', HttpMethod.put)
    cDelete = findRoute('/c/testC', HttpMethod.delete)
    dGet = findRoute('/d/testD', HttpMethod.get)
  })
  afterEach(() => {
    logger = undefined
    generator = undefined
    // (repository as any).providers.clear();
  })

  describe('generateRoutes', () => {
    it('generates a route for each http method configured for each method in each controller', () => {
      expect(routes.length).to.equal(5)
      expect(aGet).to.exist
      expect(aPost).to.exist
      expect(bPut).to.exist
      expect(cDelete).to.exist
      expect(dGet).to.exist
    })

    describe('route paths', () => {
      it('adds forward slashes between controller and method paths if they are missing', () => {
        expect(aGet).to.exist
        expect(bPut).to.exist
        expect(cDelete).to.exist
      })
      it('dedupes slashes between controller and paths', () => {
        expect(dGet).to.exist
      })
    })

    describe('authorization', () => {
      it('does not include authorization info if neither the controller nor method define it', () => {
        expect(aGet.authorization).to.be.undefined
        expect(aPost.authorization).to.be.undefined
      })
      it('includes authorization from the controller', () => {
        expect(cDelete.authorization).not.to.be.undefined
        expect(cDelete.authorization).to.deep.equal([IsAuthorized])
      })
      it('includes authorization from the method', () => {
        expect(dGet.authorization).not.to.be.undefined
        expect(dGet.authorization).to.deep.equal([IsAuthorized])
      })
    })

    describe('cors', () => {
      it('gets simple cors config from the controller', () => {
        expect(aGet.cors).to.be.true
      })
      it('gets specific cors config from the controller', () => {
        expect(bPut.cors).to.deep.equal({})
      })
      it('gets simple cors config from the method', () => {
        expect(cDelete.cors).to.be.true
      })
      it('gets specific cors config from the method', () => {
        expect(dGet.cors).to.deep.equal({})
      })
    })
  })
})
