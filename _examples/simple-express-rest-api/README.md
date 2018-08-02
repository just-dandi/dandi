# Dandi Example - Simple Express REST API

This example demonstrates usage of the following `@dandi` packages:

- `@dandi/core`
- `@dandi/mvc`
- `@dandi/mvc-express`
- `@dandi/model-validation`

## Running the Example

From a command line in the
`[dandi-project-root]/_examples/simple-express-rest-api` directory:

1. run `npm install` if you haven't already
2. run `npm start`
3. The server should be accessible from `http://localhost:7080/`

### Available Endpoints

- `GET http://localhost:7080/data` - list all entries
- `POST http://localhost:7080/data` - create an entry
- `GET http://localhost:7080/data/:id` - get the specified entry
- `PUT http://localhost:7080/data/:id` - replace the specified entry
- `DELETE http://localhost:7080/data/:id` - delete the specified entry

## Project Files

### server.ts

This file is used as the entry point for the application. It loads and
starts the container.

### src/server.container.ts

This file is used to construct the `@dandi` DI container used to run
the application. It pulls in the MVC service implementations from
`@dandi/mvc` and `@dandi/mvc-express`, validation implementations from
`@dandi/model-validation`, as well as the controller used in
the application itself.

### src/data/data.model.ts

Defines the `DataModel` and `DataModelRequest` models. Note the
decorators from `@dandi/model` used to define properties in the model
classes.

### src/data/data.service.ts

Defines the `DataService` which is used in this application a simple
data repository.

### src/data/data.controller.ts

Provides access to `DataService` by defining a RESTful API accessible
via HTTP.
