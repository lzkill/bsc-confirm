import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config/config-helper';
import { AppConfigModule } from './config/config.module';
import { ConfirmModule } from './confirm/confirm.module';
import { AppLoggerModule } from './shared/logger/logger.module';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    ConfirmModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [() => config.createConfig()],
    }),
  ],
})
export class AppModule {}
