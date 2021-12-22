import { Injectable } from '@nestjs/common';
import { IMetaResult } from 'biscoint-api-node/dist/typings/biscoint';
import { BiscointService } from 'src/shared/biscoint/biscoint.service';
import { AppLoggerService } from 'src/shared/logger/logger.service';

@Injectable()
export class RateLimitedBiscointService {
  private windowMs: number;
  private maxRequests: number;

  private confirmCount = 0;

  constructor(
    private logger: AppLoggerService,
    private biscoint: BiscointService,
  ) {}

  async init() {
    try {
      const meta = await this.biscoint.meta();
      this.setRateLimitValues(meta);
      this.logger.log(`Rate limited Biscoint service initialized`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  private setRateLimitValues(meta: IMetaResult) {
    const { windowMs, maxRequests } =
      meta.endpoints['offer/confirm'].post.rateLimit;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  confirmOffer(offerId: string) {
    this.confirmCount += 1;
    return this.biscoint.confirm({ offerId: offerId });
  }

  getConfirmWaitIntervalMs(elapsedMs: number) {
    const minIntervalMs = Math.ceil(
      (this.confirmCount * this.windowMs) / this.maxRequests,
    );
    return Math.max(minIntervalMs - elapsedMs, 0);
  }

  resetConfirmCount() {
    this.confirmCount = 0;
  }
}
