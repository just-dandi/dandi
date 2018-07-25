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

### Misc
- `Disposable` interface and utilities for managing disposable resources
- Uses [Luxon](https://moment.github.io/luxon/) as a replacement for Date objects
- Models can be reused between backend NodeJS and frontend TypeScript/JavaScript applications
- `Uuid` class based on the [uuid](https://github.com/kelektiv/node-uuid) library for working with and comparing UUIDs.

# Core Modules

* **[@dandi/core](./core)** 🕸 - Core types and utilities
* **[@dandi/data](./data)** - Base types and utilities for working with data services
* **[@dandi/config](./config)** - Configuration services
* **[@dandi/di-core](./di-core)** - Dependency Injection
* **[@dandi/model](./model)** 🕸 - Model decorators
* **[@dandi/model-validation](./model-validation)** - Model validation utilities
* **[@dandi/mvc](./mvc)** - MVC decorators and base utilities (not specific to Express)

# 3rd Party Integration Modules
* **[@dandi/aws-lambda](./aws-lambda-wrap)** Helpers for using `@dandi/di-core` with AWS Lambda
* **[@dandi/config-aws-ssm](./config-aws-ssm)** - `@dandi/config` client for AWS SSM Parameter Store
* **[@dandi/data-pg](./data-pg)** - `@dandi/data` client implementations for Postgres
* **[@dandi/mvc-auth-firebase](./mvc-auth-firebase)** - Google Firebase Authorization service implementation for `@dandi/mvc`
* **[@dandi/mvc-express](./mvc-express)** - Express-specific `@dandi/mvc` service implementations

🕸 - web browser compatible/no NodeJS-specific dependencies
