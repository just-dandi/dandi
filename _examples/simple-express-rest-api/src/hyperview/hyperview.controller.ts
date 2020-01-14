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
  @View('index.pug', { xml: true })
  public index(): void {}

  @HttpPost('detail.xml')
  @View('detail.pug', { xml: true })
  public detail(@RequestBody(FormModel) form: FormModel): any {
    return form
  }

}
