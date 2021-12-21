import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './logger.service';
import { PapertrailService } from './papertrail.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [AppLoggerService, PapertrailService],
  exports: [AppLoggerService],
})
export class AppLoggerModule {}
