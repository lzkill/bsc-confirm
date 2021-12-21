import { Injectable, Logger } from '@nestjs/common';
import { PapertrailService } from './papertrail.service';

@Injectable()
export class AppLoggerService {
  private logger = new Logger(this.constructor.name);

  constructor(private papertrail: PapertrailService) {}

  error(message: any, context?: string) {
    try {
      if (context) this.logger.error(message, null, context);
      else this.logger.error(message);

      // non-blocking
      this.papertrail.sendMessageAsJson(message);
    } catch (e) {
      this.logger.error(e);
    }
  }

  log(message: any, context?: string) {
    if (context) this.logger.log(message, context);
    else this.logger.log(message);
  }

  warn(message: any, context?: string) {
    if (context) this.logger.warn(message, context);
    else this.logger.warn(message);
  }
}
