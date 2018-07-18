import { Controller, HttpGet } from '@dandi/core/mvc';

@Controller('/test/basic')
class BasicTestController {

    constructor() {
        console.log('[BasicTestController] ctr');
    }

    @HttpGet()
    public noAdditionalPath() {
        console.log('[BasicTestController] noAdditionalPath');
    }

    @HttpGet('/more/path')
    public morePath() {
        console.log('[BasicTestController] morePath');
    }
}
