# @dandi

Dandi is a modular DI and MVC framework designed to make it easier to write
RESTful APIs and other services for NodeJS. It is split into modules to
allow developers to use only the features they require.

## Features

### Dependency Injection

- Modeled after [Angular](https://angular.io)'s dependency injection system
- Both constructors and methods can be injected with dependencies
- 3rd party dependencies can be configured to be injected with Providers

### MVC

- Modeled after [ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/overview)
- Built on top of [Express 4](https://expressjs.com/)
- Decorator-based route configuration
- Automatic path parameter, query parameter, and body model mapping and validation
- Support for automatically generating [HAL](http://stateless.co/hal_specification.html) output

### Model Building and Validation

- Robust set of decorators for defining models and validation metadata
- Automatically construct model class instances from JSON objects or POJOs
- Convert from objects using a different property key casing
  (e.g. `snake_case` to `camelCase`)

### Misc

- `Disposable` interface and utilities for managing disposable resources
- Uses [Luxon](https://moment.github.io/luxon/) as a replacement for Date objects
- Models can be reused between backend NodeJS and frontend TypeScript/JavaScript applications
- `Uuid` class based on the [uuid](https://github.com/kelektiv/node-uuid) library for working with and comparing UUIDs.

# Core Modules

- **[@dandi/common](./common)** 🕸 - Common types and utilities
- **[@dandi/core](./core)** 🕸 - Dependency Injection
- **[@dandi/core-node](./core-node)** - Additional DI utilities specific to NodeJS
- **[@dandi/data](./data)** 🕸 - Base types and utilities for working with data services
- **[@dandi/config](./config)** 🕸 - Configuration services
- **[@dandi/hal](./hal)** - 🕸 - Model decorators, basic types and utilities for supporting HAL
- **[@dandi/model](./model)** 🕸 - Model decorators
- **[@dandi/model-builder](./model-builder)** 🕸 - Utilities for dynamically constructing and validating models
- **[@dandi/mvc](./mvc)** - MVC decorators and base utilities (not specific to Express)
- **[@dandi/mvc-hal](./mvc-hal)** - Supports rendering HAL JSON from existing `@dandi/mvc` controllers

# 3rd Party Integration Modules

- **[@dandi-contrib/aws-lambda](./_contrib/aws-lambda-wrap)** Helpers for using `@dandi/di-common` with AWS Lambda
- **[@dandi-contrib/config-aws-ssm](./_contrib/config-aws-ssm)** - `@dandi/config` client for AWS SSM Parameter Store
- **[@dandi-contrib/data-pg](./_contrib/data-pg)** - `@dandi/data` client implementations for Postgres
- **[@dandi-contrib/mvc-auth-firebase](./_contrib/mvc-auth-firebase)** - Google Firebase Authorization service implementation for `@dandi/mvc`
- **[@dandi-contrib/mvc-express](./_contrib/mvc-express)** - Express-specific `@dandi/mvc` service implementations

🕸 - web browser compatible/no NodeJS-specific dependencies

# Examples

[Simple Express REST API](./_examples/simple-express-rest-api) - An
implementation of a very simple REST API using `@dandi`
