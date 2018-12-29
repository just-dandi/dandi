# @dandi/mvc-view

`@dandi/mvc-view` provides services for rendering view templates from `@dandi/mvc` controllers.

## Configure View Engines

Use `MvcViewModule` when constructing your application's container to map file extensions to view engines:

```js
import { Container } from '@dandi/core'
import { MvcViewModule } from '@dandi/mvc-view'
import { EjsViewEngine } from '@dandi-contrib/mvc-view-ejs'
import { PugViewEngine } from '@dandi-contrib/mvc-view-pug'

new Container({
  providers: [
    MvcViewModule
      .engine('ejs', EjsViewEngine)
      .engine('pug', PugViewEngine),
  ],
});
```

## Static View Resolution

Use the `@View()` decorator on controller endpoints that should return a view instead of data. Specify the name of the
template. The internal view resolver will locate files with configured extensions relative to the controller's file
path. Alternatively, you can specify the extension to short-circuit the file searching process.

View resolution results are cached in memory, so subsequent requests for the same template name will
always use the same file and view engine.

```js
import { Controller, HttpGet } from '@dandi/mvc'
import { View } from '@dandi/mvc-view'

@Controller('my')
class MyController {
  
  @HttpGet('static')
  @View('static-template-name')
  staticTemplateName() {
    return { some: 'data' }
  }
  
  @HttpGet('static-ext')
  @View('static-template-name.pug')
  staticTemplateNamePug() {
    return { some: 'data' }
  }
  
}
```

## Dynamic View Resolution

If the name of the view cannot be statically defined, omit the view name from the `@View()` decorator,
and use the injectable `ViewResultFactory` function to generate and return a view result:

```js
import { Inject } from '@dandi/core'
import { Controller, HttpGet } from '@dandi/mvc'
import { View, ViewResultFactory } from '@dandi/mvc-view'

@Controller('my')
class MyController {
  
  constructor(
    @Inject(ViewResultFactory) private viewResult: ViewResultFactory,
  ) {}
  
  @HttpGet('dynamic')
  @View()
  dynamicTemplateName() {
    const viewName = Math.random() > 0.5 ? 'dynamic-a' : 'dynamic-b'
    return this.viewResult(viewName, { some: 'data' })
  }
  
}
```
