import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfirmService } from './confirm/confirm.service';
import { TelegramService } from './confirm/telegram.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(0);

  const telegram = app.get(TelegramService);
  await telegram.init();

  const confirm = app.get(ConfirmService);
  await confirm.init();
}

bootstrap();
