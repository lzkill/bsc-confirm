import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RateLimitedBiscointService } from './confirm/rate-limited/biscoint.service';
import { TelegramService } from './confirm/rate-limited/telegram.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(0);

  const telegram = app.get(TelegramService);
  await telegram.init();

  const biscoint = app.get(RateLimitedBiscointService);
  await biscoint.init();
}

bootstrap();
