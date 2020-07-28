import { HyperviewMimeTypes } from '@dandi-contrib/mvc-view-hyperview'
import { RequestBody } from '@dandi/http-model'
import { Property, Required } from '@dandi/model'
import { Controller, HttpGet, HttpPost } from '@dandi/mvc'
import { View } from '@dandi/mvc-view'

class FormModel {
  @Required()
  @Property(String)
  public name: string

  @Required()
  @Property(String)
  public thing: string
}

@Controller('/')
export class HyperviewController {
  @HttpGet('index.xml')
  @View('index.pug', HyperviewMimeTypes.hyperviewMarkup)
  public index(): void {
    return
  }

  @HttpPost('detail.xml')
  @View('detail.pug', HyperviewMimeTypes.hyperviewMarkup)
  public detail(@RequestBody(FormModel) form: FormModel): any {
    return form
  }
}
