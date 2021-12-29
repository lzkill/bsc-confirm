import { Injectable } from '@nestjs/common';
import { IMetaResult } from 'biscoint-api-node/dist/typings/biscoint';
import { AppConfigService } from 'src/config/config.service';
import { BiscointService } from 'src/shared/biscoint/biscoint.service';
import { AppLoggerService } from 'src/shared/logger/logger.service';
import { FasterEMA } from 'trading-signals';

@Injectable()
export class RateLimitedBiscointService {
  private windowMs: number;
  private maxRequests: number;
  private confirmEma: FasterEMA;

  private confirmCount = 0;

  constructor(
    private config: AppConfigService,
    private logger: AppLoggerService,
    private biscoint: BiscointService,
  ) {
    this.initConfirmEma();
  }

  private initConfirmEma() {
    const interval = this.config.app.emaInterval;
    const initialValue = this.config.app.emaInitialValue;
    this.confirmEma = new FasterEMA(interval);
    for (let i = 0; i < interval; i++) {
      this.confirmEma.update(initialValue);
    }
  }

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
    const startedAt = Date.now();
    const confirmation = this.biscoint.confirm({ offerId: offerId });
    const finishedAt = Date.now();
    const elapsedMs = finishedAt - startedAt;
    this.confirmEma.update(elapsedMs);
    this.confirmCount += 1;
    return confirmation;
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

  getAvgConfirmTime() {
    return this.confirmEma.getResult();
  }
}
