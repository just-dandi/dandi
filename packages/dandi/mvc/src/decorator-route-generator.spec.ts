import { Repository } from '@dandi/core/internal'
import { stubHarness } from '@dandi/core/testing'
import { HttpMethod } from '@dandi/http'
import {
  Authorized,
  Controller,
  Cors,
  DecoratorRouteGenerator,
  HttpDelete,
  HttpGet,
  HttpPost,
  HttpPut,
  IsAuthorized,
  Route,
} from '@dandi/mvc'

import { expect } from 'chai'

/* eslint-disable @typescript-eslint/no-unused-vars */
describe('DecoratorRouteGenerator', function() {

  @Controller('/decorator-route-generator/a')
  @Cors()
  class TestControllerA {
    @HttpGet('testA')
    @HttpPost('/testA')
    public testMethod(): void {}
  }
  @Controller('/decorator-route-generator/b')
  @Cors({})
  class TestControllerB {
    @HttpPut('testB')
    public testMethod(): void {}
  }
  @Controller('decorator-route-generator/c')
  @Authorized()
  class TestControllerC {
    @HttpDelete('testC')
    @Cors()
    public testMethod(): void {}
  }
  @Controller('/decorator-route-generator/d/')
  class TestControllerD {
    @HttpGet('/testD')
    @Authorized()
    @Cors({})
    public testMethod(): void {}
  }

  const harness = stubHarness(DecoratorRouteGenerator)

  beforeEach(async function() {
    this.generator = await harness.inject(DecoratorRouteGenerator)
    this.repository = Repository.for(Controller)

    this.findRoute = (path, httpMethod): Route => {
      return this.routes.find(
        (route) => route.path === `/decorator-route-generator${path}` && route.httpMethod === httpMethod,
      )
    }

    this.routes = this.generator.generateRoutes().filter((route: Route) => route.path.startsWith('/decorator-route-generator/'))
    this.aGet = this.findRoute('/a/testA', HttpMethod.get)
    this.aPost = this.findRoute('/a/testA', HttpMethod.post)
    this.bPut = this.findRoute('/b/testB', HttpMethod.put)
    this.cDelete = this.findRoute('/c/testC', HttpMethod.delete)
    this.dGet = this.findRoute('/d/testD', HttpMethod.get)
  })

  describe('generateRoutes', function() {
    it('generates a route for each http method configured for each method in each controller', function() {
      expect(this.routes.length).to.equal(5)
      expect(this.aGet).to.exist
      expect(this.aPost).to.exist
      expect(this.bPut).to.exist
      expect(this.cDelete).to.exist
      expect(this.dGet).to.exist
    })

    describe('route paths', function() {
      it('adds forward slashes between controller and method paths if they are missing', function() {
        expect(this.aGet).to.exist
        expect(this.bPut).to.exist
        expect(this.cDelete).to.exist
      })
      it('dedupes slashes between controller and paths', function() {
        expect(this.dGet).to.exist
      })
    })

    describe('authorization', function() {
      it('does not include authorization info if neither the controller nor method define it', function() {
        expect(this.aGet.authorization).to.be.undefined
        expect(this.aPost.authorization).to.be.undefined
      })
      it('includes authorization from the controller', function() {
        expect(this.cDelete.authorization).not.to.be.undefined
        expect(this.cDelete.authorization).to.deep.equal([IsAuthorized])
      })
      it('includes authorization from the method', function() {
        expect(this.dGet.authorization).not.to.be.undefined
        expect(this.dGet.authorization).to.deep.equal([IsAuthorized])
      })
    })

    describe('cors', function() {
      it('gets simple cors config from the controller', function() {
        expect(this.aGet.cors).to.be.true
      })
      it('gets specific cors config from the controller', function() {
        expect(this.bPut.cors).to.deep.equal({})
      })
      it('gets simple cors config from the method', function() {
        expect(this.cDelete.cors).to.be.true
      })
      it('gets specific cors config from the method', function() {
        expect(this.dGet.cors).to.deep.equal({})
      })
    })
  })
})
/* eslint-enable @typescript-eslint/no-unused-vars */
