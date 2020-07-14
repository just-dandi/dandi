import { Inject, Injectable } from '@dandi/core'
import { MailService } from '@sendgrid/mail'
import * as client from '@sendgrid/mail'

import { SendGridConfig } from './send-grid-config'

@Injectable()
export class SendGridClient extends MailService {
  constructor(@Inject(SendGridConfig) config: SendGridConfig) {
    super()
    Object.assign(this, client)
    this.setApiKey(config.apiKey)
  }
}
