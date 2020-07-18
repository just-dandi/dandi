# @dandi/model

`@dandi/model` provides decorators for defining models and validation
metadata.

`@dandi/model` does not have any dependencies on NodeJS, and therefore
can be used on classes shared with projects targeted for the web.

## Specifying Type

The type of a model member is defined using the `@Property()` decorator:

```typescript
import { Property } from '@dandi/model'

class MyModel {
  @Property(String)
  public name: string
}
```

### TypeScript

Even with TypeScript, since there is no type data at runtime, you must
provide a class in order to define a type. While it may be possible to
use post processing using the generated AST to determine type, it is not
implemented at this time.

In general, the type of the member should match the type specified in
`@Property()` decorator.

### Complex Models

Models can have any number of levels of hierarchy, so long as the class
for child models is referenced in the `@Property` decorator:

```typescript
import { Property } from '@dandi/model'

class ParentModel {
  @Property(ChildModel)
  public child: ChildModel
}

class ChildModel {
  @Property(String)
  public name: string
}
```

### Using @Property with Primitive Types

When using the `@Property()` decorator for a native primitive type such
as `string`, `number`, or `boolean`, use the corresponding class:

```typescript
import { Property } from '@dandi/model'

class MyModel {
  @Property(String)
  public stringProperty: string

  @Property(Number)
  public numberProperty: number

  @Property(Boolean)
  public booleanProperty: boolean
}
```

In these cases, the class version of the primitive type is only used to
identify the type. Validators should set the property using the native
primitive type rather than the class.

## Arrays

`Array<T>` properties must use the `@ArrayOf()` decorator to define the type
of the array. The `@ArrayOf()` decorator is used in place of
`@Property()`:

```typescript
import { ArrayOf } from '@dandi/model'

class MyModel {
  @ArrayOf(String)
  public allMyStrings: string[]
}
```

## Sets

`Set<T>` properties must use the `@SetOf()` decorator to define the type
of items contained in the set. The `@SetOf()` decorator is used in place
of `@Property()`:

```typescript
import { SetOf } from '@dandi/model'

class MyModel {
  @SetOf(String)
  public setMeUp: Set<string>
}
```

## Maps

`Map<TKey, TValue>` properties must use the `@MapOf()` decorator to define the type
of items contained in the set. The `@MapOf()` decorator is used in place
of `@Property()`:

```typescript
import { Uuid } from '@dandi/common'
import { MapOf } from '@dandi/model'

class MyModel {
  @MapOf(Uuid, Number)
  public hereIsAMap: Map<Uuid, Number>[]
}
```

## Required Members

Use the `@Required()` decorator to specify a member that must be present
in order to pass validation.

```typescript
import { Property, Required } from '@dandi/model'

class MyModel {
  @Property(String)
  @Required()
  public youNeedThis: string
}
```

## Array and String Length

Use the `@MinLength()` and `@MaxLength()` decorators to define length
requirements for a string or array. These decorators are valid on any
type that has a `length` property.

```typescript
import { ArrayOf, MaxLength, MinLength, Property } from '@dandi/model'

class MyModel {
  @Property(String)
  @MinLength(20)
  public longString: string

  @Property(String)
  @MaxLength(5)
  public shortString: string

  @ArrayOf(String)
  @MinLength(1)
  public gottaHaveOne: string[]
}
```

## Number Value Constraints

Use the `@MinValue()` and `@MaxValue()` decorators to define value
requirements for number values.

```typescript
import { MaxValue, MinValue, Property } from '@dandi/model'

class MyModel {
  @Property(Number)
  @MinValue(5)
  @MaxValue(25)
  public llamaCount: string
}
```

## Members with Multiple Valid Types

Use the `@OneOf()` decorator in place of `@Property()` to allow a member
be validated as one of two or more types.

```typescript
import { OneOf } from '@dandi/model'

class MyModel {
  @OneOf(Number, String)
  public key: number | string
}
```

When using `@OneOf()`, the validator will use the first type that
successfully validates. In the above example, the validator would first
attempt to convert the value to a `number`, falling back to a `string`
if it failed.

## Other Decorators

- `@Pattern()` - accepts a `RegExp` pattern that must be matched
- `@Email()` - a shorthand decorator for `@Property(String)`,
  `@Pattern()` using a built-in email validation pattern,
  `@MinLength(6)`, and `@MaxLength(254)`
  [1](https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address)
- `@UrlProperty()` - a shorthand decorator for `@Property(Url)`, and
  `@Pattern()` using a built-in url validation pattern
- `@DateTimeFormat(pattern)` - a shorthand decorator for
  `@Property(DateTime)` that define the specified pattern to be used for
  parsing the Luxon `DateTime` object.
- `@UrlArray` - similar to `@UrlProperty()`, except it uses
  `@ArrayOf(Url)` instead of `@Property(Url)`

---

1: https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
