# @dandi/model-builder

The `@dandi/model-builder` package contains utilities for dynamically
constructing and validating models defined using decorators from
`@dandi/model`.

`ModelBuilder` can be used on its own, and it is used by several other
Dandi packages to provide automatic construction and validation of
data models:

- `@dandi/mvc` - data binding and validation by `@RequestBody()`,
  `@PathParam()`, and `@QueryParam()`
- `@dandi/data` - validates integrity of database connection configuration
- `@dandi-contrib/data-pg` - converts data from their database representations
  to their defined models when using `queryModel` and `queryModelSingle`
- `@dandi-contrib/aws-lambda` - converts incoming AWS event data to Dandi
  models
