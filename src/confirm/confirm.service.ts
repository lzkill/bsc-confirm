import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import {
  IMetaResult,
  IOfferResult,
} from 'biscoint-api-node/dist/typings/biscoint';
import {
  RABBITMQ_BISCOINT_CONFIRM_KEY,
  RABBITMQ_BISCOINT_EXCHANGE,
} from 'src/app-constants';
import { AppConfigService } from 'src/config/config.service';
import { BiscointService } from 'src/shared/biscoint/biscoint.service';
import { AppLoggerService } from 'src/shared/logger/logger.service';

export interface ConfirmJob {
  offers: IOfferResult[];
  stopOnFail?: boolean;
}

@Injectable()
export class ConfirmService {
  private windowMs: number;
  private maxRequests: number;

  private jobCount = 0;

  constructor(
    private config: AppConfigService,
    private logger: AppLoggerService,
    private biscoint: BiscointService,
  ) {}

  async init() {
    try {
      const meta = await this.biscoint.meta();
      this.setRateLimitValues(meta);
      this.logger.log(`Confirm service initialized`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async setRateLimitValues(meta: IMetaResult) {
    const { windowMs, maxRequests } =
      meta.endpoints['offer/confirm'].post.rateLimit;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  @RabbitSubscribe({
    exchange: RABBITMQ_BISCOINT_EXCHANGE,
    routingKey: RABBITMQ_BISCOINT_CONFIRM_KEY,
    queueOptions: {
      autoDelete: true,
    },
  })
  async confirm(job: ConfirmJob) {
    try {
      // When disabled the job just goes into oblivion
      if (this.config.app.enabled) {
        const startedAt = Date.now();

        let attemptCount = 0; // how many confirms have been attempted?
        let confirmCount = 0; // how many confirms have been actually done?

        let canConfirm = true;
        for (const offer of job.offers) {
          canConfirm &&= this.canConfirm(offer);
          let confirmation;
          if (canConfirm) {
            confirmation = await this._confirm(offer);
            attemptCount += 1;
            confirmCount += confirmation ? 1 : 0;
          }

          canConfirm &&= job.stopOnFail ? confirmation : true;
        }

        const finishedAt = Date.now();
        const elapsedMs = finishedAt - startedAt;

        this.logger.log(
          `Confirm job #${this.jobCount} took ${elapsedMs.toFixed(
            2,
          )}ms (${confirmCount}/${job.offers.length} offers confirmed)`,
        );
        this.jobCount += 1;

        const waitIntervalMs = this.getWaitIntervalMs(attemptCount, elapsedMs);

        await this.wait(waitIntervalMs);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  private canConfirm(offer: IOfferResult) {
    return offer && !this.isExpired(offer);
  }

  private isExpired(offer: IOfferResult) {
    const expiresAt = new Date(offer.expiresAt).getTime();
    const now = Date.now();
    return expiresAt <= now;
  }

  private async _confirm(offer: IOfferResult) {
    try {
      const confirmation = await this.biscoint.confirm({
        offerId: offer.offerId,
      });

      if (confirmation)
        this.logger.log(`Offer ${offer.offerId} confirmed (${offer.op})`);

      return confirmation;
    } catch (e) {
      this.logger.error(e);
    }
  }

  // TODO Create a rate limited service
  private getWaitIntervalMs(confirmCount: number, elapsedMs: number) {
    const minIntervalMs = Math.ceil(
      (confirmCount * this.windowMs) / this.maxRequests,
    );
    return Math.max(minIntervalMs - elapsedMs, 0);
  }

  private wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
