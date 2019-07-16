import { AuthorizationCondition, AuthorizationMetadata, mergeAuthorization } from '@dandi/mvc'

import { expect } from 'chai'

describe('AuthorizationMetadata', () => {
  describe('mergeAuthorization', () => {
    it('returns undefined if no arguments are passed', () => {
      expect(mergeAuthorization()).to.be.undefined
    })

    it('returns undefined if none of the entries have conditions', () => {
      expect(mergeAuthorization({ authorization: [] })).to.be.undefined
    })

    it('returns a single object with all conditions from each entry', () => {
      const entry1: AuthorizationMetadata = {
        authorization: [{ provide: AuthorizationCondition, useValue: { allowed: true } }],
      }
      const entry2: AuthorizationMetadata = {
        authorization: [
          {
            provide: AuthorizationCondition,
            useValue: { allowed: false, reason: 'cuz' },
          },
        ],
      }
      expect(mergeAuthorization(entry1, entry2)).to.deep.equal({
        authorization: [entry1.authorization[0], entry2.authorization[0]],
      })
    })

    it('only includes unique entries', () => {
      const entry1: AuthorizationMetadata = {
        authorization: [{ provide: AuthorizationCondition, useValue: { allowed: true } }],
      }
      const entry2: AuthorizationMetadata = {
        authorization: [
          {
            provide: AuthorizationCondition,
            useValue: { allowed: false, reason: 'cuz' },
          },
          entry1.authorization[0],
        ],
      }
      expect(mergeAuthorization(entry1, entry2)).to.deep.equal({
        authorization: [entry1.authorization[0], entry2.authorization[0]],
      })
    })
  })
})
