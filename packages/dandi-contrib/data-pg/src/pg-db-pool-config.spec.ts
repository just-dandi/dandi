import { PgDbPoolConfig } from '@dandi-contrib/data-pg'

import { expect } from 'chai'

describe('PgDbConfig', function () {
  beforeEach(function () {
    this.connectionInfo = {
      host: 'localhost',
      port: 5432,
      database: 'test',
    }
    this.userCredentials = {
      username: 'AzureDiamond',
      password: 'hunter2',
    }
    this.config = new PgDbPoolConfig(this.connectionInfo, this.userCredentials)
  })

  describe('ctr', function () {
    it('adds the values of the provided connection info', function () {
      expect(this.config).to.include(this.connectionInfo)
    })

    it('adds the value of the provided user credentials', function () {
      expect(this.config).to.include(this.userCredentials)
    })

    it('populates the user property with the value of the user credentials username', function () {
      expect(this.config.user).to.equal(this.userCredentials.username)
    })
  })
})
