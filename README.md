# @dandi

[![Build Status](https://travis-ci.org/dandi-mvc/dandi.svg?branch=master)](https://travis-ci.org/dandi-mvc/dandi)
[![Coverage Status](https://coveralls.io/repos/github/dandi-mvc/dandi/badge.svg)](https://coveralls.io/github/dandi-mvc/dandi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
- Web framework agnostic - Built for [Express 4](https://expressjs.com/), but can be used with other frameworks if desired
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
- **[@dandi/mvc-view](./mvc-view)** - Use `@dandi/mvc` with your favorite templating engine

# 3rd Party Integration Modules

- **[@dandi-contrib/aws-lambda](./_contrib/aws-lambda)** Helpers for using `@dandi/di-common` with AWS Lambda
- **[@dandi-contrib/config-aws-ssm](./_contrib/config-aws-ssm)** - `@dandi/config` client for AWS SSM Parameter Store
- **[@dandi-contrib/data-pg](./_contrib/data-pg)** - `@dandi/data` client implementations for Postgres
- **[@dandi-contrib/mvc-auth-firebase](./_contrib/mvc-auth-firebase)** - Google Firebase Authorization service implementation for `@dandi/mvc`
- **[@dandi-contrib/mvc-express](./_contrib/mvc-express)** - Express-specific `@dandi/mvc` service implementations
- **[@dandi-contrib/mvc-view-ejs](./_contrib/mvc-view-ejs)** - [EJS](https://ejs.co) implementation for `@dandi/mvc-view`
- **[@dandi-contrib/mvc-view-pug](./_contrib/mvc-view-pug)** - [Pug](https://pugjs.org) implementation for `@dandi/mvc-view`

🕸 - web browser compatible/no NodeJS-specific dependencies

# Examples

[Simple Express REST API](./_examples/simple-express-rest-api) - An
implementation of a very simple REST API using `@dandi`
