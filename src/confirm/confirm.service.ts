import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { IOfferResult } from 'biscoint-api-node/dist/typings/biscoint';
import {
  RABBITMQ_BISCOINT_CONFIRM_KEY,
  RABBITMQ_BISCOINT_EXCHANGE,
} from 'src/app-constants';
import { AppConfigService } from 'src/config/config.service';
import { AppLoggerService } from 'src/shared/logger/logger.service';
import { RateLimitedBiscointService } from './rate-limited/biscoint.service';

export interface ConfirmJob {
  offers: IOfferResult[];
  stopOnFail?: boolean;
}

@Injectable()
export class ConfirmService {
  private jobCount = 0;

  constructor(
    private config: AppConfigService,
    private logger: AppLoggerService,
    private biscoint: RateLimitedBiscointService,
  ) {}

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

        if (this.canConfirm(job.offers)) {
          let mustStop = false;
          for (const offer of job.offers) {
            let confirmation;
            if (!mustStop) {
              confirmation = await this.confirmOffer(offer);
              attemptCount += 1;
              confirmCount += confirmation ? 1 : 0;
            }

            mustStop ||= confirmation ? false : job.stopOnFail;
          }
        }

        const finishedAt = Date.now();
        const elapsedMs = finishedAt - startedAt;

        this.logger.log(
          `Confirm job #${this.jobCount} took ${elapsedMs.toFixed(
            2,
          )}ms (${confirmCount}/${job.offers.length} offers confirmed)`,
        );
        this.jobCount += 1;

        const waitIntervalMs =
          this.biscoint.getConfirmWaitIntervalMs(elapsedMs);
        this.biscoint.resetConfirmCount();
        await this.wait(waitIntervalMs);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  private canConfirm(offers: IOfferResult[]) {
    const avgConfirmTime = this.biscoint.getAvgConfirmTime();
    const now = Date.now();

    let canConfirm = true;
    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      const expiresAt = new Date(offer.expiresAt).getTime();
      const timeRequired = avgConfirmTime * (i + 1);
      canConfirm &&= now + timeRequired <= expiresAt;
    }

    return canConfirm;
  }

  private async confirmOffer(offer: IOfferResult) {
    try {
      const confirmation = await this.biscoint.confirmOffer(offer.offerId);

      if (confirmation)
        this.logger.log(`Offer ${offer.offerId} confirmed (${offer.op})`);

      return confirmation;
    } catch (e) {
      this.logger.error(e);
    }
  }

  private wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
