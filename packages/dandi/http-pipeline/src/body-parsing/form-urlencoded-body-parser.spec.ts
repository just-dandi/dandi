import { testHarness } from '@dandi/core/testing'
import { HttpRequestHeadersAccessor, HttpRequestHeadersHashAccessor } from '@dandi/http'
import { FormUrlencodedBodyParser } from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('FormUrlEncodedBodyParser', () => {

  const harness = testHarness(FormUrlencodedBodyParser)

  let parser: FormUrlencodedBodyParser
  let headers: HttpRequestHeadersAccessor

  beforeEach(async () => {
    parser = await harness.inject(FormUrlencodedBodyParser)
    headers = HttpRequestHeadersHashAccessor.fromRaw({})
  })
  afterEach(() => {
    parser = undefined
    headers = undefined
  })

  describe('parseBody', () => {

    it('can parse simple url encoded bodies', async () => {
      const body = 'foo=bar'

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ foo: 'bar' })
    })

    it('can parse url encoded bodies with multiple keys', async () => {
      const body = 'foo=bar&bleep=bloop'

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ foo: 'bar', bleep: 'bloop' })
    })

    it('decodes url encoded values', async () => {
      const body = 'foo=bar%20bar&bleep=bloop%26blarp'

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ foo: 'bar bar', bleep: 'bloop&blarp' })
    })

    it('combines duplicate keys into array values', async () => {
      const body = 'bleep=bloop&bleep=blarp'

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ bleep: ['bloop', 'blarp'] })
    })

    it('appends multiple duplicate keys into an array', async () => {
      const body = 'bleep=bloop&bleep=blarp&bleep=boogie'

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ bleep: ['bloop', 'blarp', 'boogie'] })
    })

  })

})
