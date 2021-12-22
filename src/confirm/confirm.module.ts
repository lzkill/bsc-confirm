import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_BISCOINT_EXCHANGE } from 'src/app-constants';
import { BiscointModule } from 'src/shared/biscoint/biscoint.module';
import { ConfirmService } from './confirm.service';
import { RateLimitedBiscointService } from './rate-limited/biscoint.service';
import { TelegramService } from './rate-limited/telegram.service';

@Module({
  imports: [
    BiscointModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          uri: config.get('rabbitmq.uri'),
          prefetchCount: 1,
          exchanges: [
            {
              name: RABBITMQ_BISCOINT_EXCHANGE,
              type: 'direct',
            },
          ],
          connectionInitOptions: { wait: false },
        };
      },
    }),
  ],
  providers: [ConfirmService, TelegramService, RateLimitedBiscointService],
})
export class ConfirmModule {}
