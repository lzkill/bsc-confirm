import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class PapertrailService {
  private PAPERTRAIL_URL = 'https://logs.collector.solarwinds.com/v1/logs';

  constructor(private config: AppConfigService, private http: HttpService) {}

  async sendMessageAsJson(message: any) {
    if (this.canLog()) {
      const logKeyAsBase64 = Buffer.from(this.config.papertrail.token).toString(
        'base64',
      );

      const body = {
        owner: this.config.app.name,
        data: message,
      };

      return this.http
        .post(this.PAPERTRAIL_URL, body, {
          headers: {
            Authorization: `Basic ${logKeyAsBase64}`,
          },
        })
        .pipe(
          map((res) => {
            return res.data;
          }),
        )
        .toPromise();
    }
  }

  private canLog() {
    return this.config.papertrail.enabled && this.config.papertrail.token;
  }
}
