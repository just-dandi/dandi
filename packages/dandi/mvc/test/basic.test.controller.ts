import { Controller, HttpGet } from '@dandi/mvc'

@Controller('/test/basic')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BasicTestController {
  constructor() {
    console.log('[BasicTestController] ctr')
  }

  @HttpGet()
  public noAdditionalPath(): void {
    console.log('[BasicTestController] noAdditionalPath')
  }

  @HttpGet('/more/path')
  public morePath(): void {
    console.log('[BasicTestController] morePath')
  }
}
