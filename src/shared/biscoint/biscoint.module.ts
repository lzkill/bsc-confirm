import { Module } from '@nestjs/common';
import { BiscointService } from './biscoint.service';

@Module({
  providers: [BiscointService],
  exports: [BiscointService],
})
export class BiscointModule {}
