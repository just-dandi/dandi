# @dandi/data-pg

`@dandi/data-pg` wraps the [node-postgres](https://node-postgres.com/)
client in implementations of `@dandi/data`'s interfaces.

See [@dandi/data](../data) for basic usage and configuration.

## Using @dandi/data-pg In Your App

In addition to setting up the connection and authentication data
described in [@dandi/data](../data#Configuration), include `PgDbModule`
in your `Container` providers:

```typescript
import { Container } from '@dandi/core';
import { PgDbModule } from '@dandi/data-pg';

const myApp = new Container({
  providers: [

    ...

    // database
    PgDbModule,

    ...

  ],
});
```

## Configuring ModelBuilder

Include a `Provider<ModelBuilderOptions>` for `PgDbModelBuilderOptions`
in your `Container` providers:

```typescript
import { Container } from '@dandi/core';
import { PgDbModelBuilderOptions, PgDbModule } from '@dandi/data-pg';
import { ModelBuilderOptions } from '@dandi/model-builder';

import { camel } from 'change-case';

const myApp = new Container({
  providers: [

    ...

    ModelBuilderOptions.provider(PgDbModelBuilderOptions, {
      keyTransform: camel,
    })

    ...

  ],
});
```
