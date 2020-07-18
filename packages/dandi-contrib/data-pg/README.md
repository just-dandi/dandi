# @dandi-contrib/data-pg

`@dandi-contrib/data-pg` wraps the [node-postgres](https://node-postgres.com/)
client in implementations of `@dandi/data`'s interfaces.

See [@dandi/data](../data) for basic usage and configuration.

## Using @dandi-contrib/data-pg In Your App

In addition to setting up the connection and authentication data
described in [@dandi/data](../data#Configuration), include `PgDbModule`
in your `DandiApplication` providers:

```typescript
import { DandiApplication } from '@dandi/core'
import { PgDbModule } from '@dandi-contrib/data-pg'

const myApp = new DandiApplication({
  providers: [

    ...

    // database
    PgDbModule,

    ...

  ],
})
```

## Configuring ModelBuilder

Include a `Provider<ModelBuilderOptions>` for `PgDbModelBuilderOptions`
in your `DandiApplication` providers:

```typescript
import { DandiApplication } from '@dandi/core'
import { PgDbModelBuilderOptions, PgDbModule } from '@dandi-contrib/data-pg'
import { ModelBuilderOptions } from '@dandi/model-builder'

import { camel } from 'change-case'

const myApp = new DandiApplication({
  providers: [

    ...

    ModelBuilderOptions.provider(PgDbModelBuilderOptions, {
      keyTransform: camel, // translates snake_case table column names to camelCase
    }),

    ...

  ],
})
```

## `SELECT` Expansion for Nested Models

`@dandi/data-pg`'s `DbQueryable` implementation allows you to map columns from `SELECT` statements for models that nest
other models. To enable this feature, you must construct your query in a specific manner:

- Add aliases to the table identifier that match the name of the property
- Include only the aliases of the tables you wish to include in the `SELECT` statement.

For example, given a model structure like so:

```typescript
class CarModel {
  @Property(Uuid)
  public carId: Uuid

  @Property(String)
  public name: string
}
class DriverModel {
  @Property(Uuid)
  public driverId: Uuid

  @Property(String)
  public name: string
}
class DriverAssignmentModel {
  @Property(DriverModel)
  public driver: DriverModel

  @Property(CarModel)
  public car: CarModel
}
```

The query might look like:

```sql
SELECT
  driver,
  car
FROM driver_assignments a
JOIN drivers driver ON a.driver_id = driver.driver_id
JOIN cars car ON a.car_id = car.car_id
```

Calling `dbClient.queryModel(DriverAssignmentModel, query)` with the above query would result in the following expansion:

```sql
SELECT
  driver.driver_id as "driver.driver_id",
  driver.name as "driver.name",
  car.car_id as "car.car_id",
  car.name as "car.name"
FROM driver_assignments a
JOIN drivers driver ON a.driver_id = driver.driver_id
JOIN cars car ON a.car_id = car.car_id
```

The dot notation in the above expanded query, combined with a camelCase key transform (as shown above) will allow the
`ModelBuilder` instance to correctly map the properties into their respective models.
