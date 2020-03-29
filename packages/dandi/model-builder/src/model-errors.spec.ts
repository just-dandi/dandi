import { ModelErrors, ModelError, ModelErrorKey } from '@dandi/model-builder'

import { expect } from 'chai'

describe('ModelErrors', () => {

  it('returns undefined when there are no errors', () => {
    expect(ModelErrors.create(Object, [])).to.be.undefined
  })

  it('sets top level keys for each memberKey', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required),
      new ModelError('bar', ModelErrorKey.required),
    ]

    const modelErrors = ModelErrors.create(Object, errors)

    expect(modelErrors).to.have.keys('foo', 'bar')
  })

  it('sets second level keys for each errorKey', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required),
      new ModelError('bar', ModelErrorKey.required),
    ]

    const modelErrors = ModelErrors.create(Object, errors)

    expect(modelErrors).to.have.nested.property('foo.required')
    expect(modelErrors).to.have.nested.property('bar.required')
  })

  it('collects multiple errors for the same member key', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required),
      new ModelError('foo', ModelErrorKey.type),
    ]

    const modelErrors = ModelErrors.create(Object, errors)

    expect(modelErrors).to.have.nested.property('foo.required')
    expect(modelErrors).to.have.nested.property('foo.type')
  })

  it('sets a "true" value for each member/error if the errors do not have more specific information', () => {

    const errors = [
      new ModelError('foo', ModelErrorKey.required),
      new ModelError('bar', ModelErrorKey.required),
    ]

    expect(ModelErrors.create(Object, errors)).to.deep.equal({
      foo: { required: true },
      bar: { required: true},
    })
  })

  it('sets the message as the value for a member error key if it is the only available information', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required, 'hi'),
    ]

    expect(ModelErrors.create(Object, errors)).to.deep.equal({
      foo: { required: 'hi' },
    })
  })

  it('creates an ModelErrorEntry if the error specifies errorData with no message', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required, undefined, undefined, 'hi'),
    ]

    expect(ModelErrors.create(Object, errors)).to.deep.equal({
      foo: { required: { errorData: 'hi' } },
    })
  })

  it('collapses MemberModelErrorInfo when the existing entry is `true`', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required),
      new ModelError('foo', ModelErrorKey.required, 'hi'),
    ]

    expect(ModelErrors.create(Object, errors)).to.deep.equal({
      foo: { required: 'hi' },
    })
  })

  it('collapses MemberModelErrorInfo when the existing entry is a value and the next entry is `true`', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required, 'hi'),
      new ModelError('foo', ModelErrorKey.required),
    ]

    expect(ModelErrors.create(Object, errors)).to.deep.equal({
      foo: { required: 'hi' },
    })
  })

  it('creates an array when the existing entry is a message', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required, 'hi'),
      new ModelError('foo', ModelErrorKey.required, 'hello'),
    ]

    expect(ModelErrors.create(Object, errors)).to.deep.equal({
      foo: { required: ['hi', 'hello'] },
    })
  })

  it('creates an array when the existing entry is an object', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required, 'hi', undefined, 'whups'),
      new ModelError('foo', ModelErrorKey.required, 'hello'),
    ]

    expect(ModelErrors.create(Object, errors)).to.deep.equal({
      foo: { required: [{ errorData: 'whups', message: 'hi' }, 'hello'] },
    })
  })

  it('adds to the existing array entry when it is an array', () => {
    const errors = [
      new ModelError('foo', ModelErrorKey.required, 'hi', undefined, 'whups'),
      new ModelError('foo', ModelErrorKey.required, 'hello'),
      new ModelError('foo', ModelErrorKey.required, 'lloose llama!'),
    ]

    expect(ModelErrors.create(Object, errors)).to.deep.equal({
      foo: { required: [{ errorData: 'whups', message: 'hi' }, 'hello', 'lloose llama!'] },
    })
  })

  describe('generateModelErrorsMessage', () => {
    it('generates a single line message when there is a single error', () => {
      const message = ModelErrors.create(Object, [new ModelError('foo', ModelErrorKey.required)]).toString()

      expect(message).to.equal('Error converting source to model Object: foo (required)')
    })

    it('generates a multi line message with the member and error keys on the first when there are multiple messages on a single error', () => {
      const message = ModelErrors.create(Object, [
        new ModelError('foo', ModelErrorKey.required, 'you need this'),
        new ModelError('foo', ModelErrorKey.required, 'for reals'),
      ]).toString()

      const expectedMessage =
`Errors converting source to model Object: foo (required)
    you need this
    for reals`

      expect(message).to.equal(expectedMessage)
    })

    it('generates a multi line message with members on separate lines when there are errors on multiple members', () => {
      const message = ModelErrors.create(Object, [
        new ModelError('foo', ModelErrorKey.required),
        new ModelError('bar', ModelErrorKey.required),
      ]).toString()

      const expectedMessage =
`Errors converting source to model Object:
    foo (required)
    bar (required)`

      expect(message).to.equal(expectedMessage)
    })

    it('generates a multi line message with members and their error keys on separate lines when there are multiple errors on multiple members', () => {
      const message = ModelErrors.create(Object, [
        new ModelError('foo', ModelErrorKey.required),
        new ModelError('foo', ModelErrorKey.type),
        new ModelError('bar', ModelErrorKey.required),
        new ModelError('bar', ModelErrorKey.type),
      ]).toString()

      const expectedMessage =
`Errors converting source to model Object:
    foo (required, type)
    bar (required, type)`

      expect(message).to.equal(expectedMessage)
    })

    it('generates a multi line message with member keys, their error keys, and their error messages on separate lines', () => {
      const message = ModelErrors.create(Object, [
        new ModelError('foo', ModelErrorKey.required, 'you need this'),
        new ModelError('foo', ModelErrorKey.type, 'not the right thing'),
        new ModelError('bar', ModelErrorKey.required, 'you need this'),
        new ModelError('bar', ModelErrorKey.type, 'not the right thing'),
      ]).toString()

      const expectedMessage =
`Errors converting source to model Object:
    foo
        (required) you need this
        (type) not the right thing
    bar
        (required) you need this
        (type) not the right thing`

      expect(message).to.equal(expectedMessage)
    })

    it('generates a multi line message with member keys, their error keys, and multiple error messages on separate lines', () => {
      const message = ModelErrors.create(Object, [
        new ModelError('foo', ModelErrorKey.required, 'you need this'),
        new ModelError('foo', ModelErrorKey.type, 'not the right thing'),
        new ModelError('foo', ModelErrorKey.type, 'do not want'),
        new ModelError('bar', ModelErrorKey.required, 'you need this'),
        new ModelError('bar', ModelErrorKey.type, 'not the right thing'),
        new ModelError('bar', ModelErrorKey.type, 'nope no thanks'),
      ]).toString()

      const expectedMessage =
`Errors converting source to model Object:
    foo
        (required) you need this
        (type)
            not the right thing
            do not want
    bar
        (required) you need this
        (type)
            not the right thing
            nope no thanks`

      expect(message).to.equal(expectedMessage)
    })
  })

})
