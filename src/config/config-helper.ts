import * as joi from 'joi';
import * as schemas from './config-schemas';

class AppConfigService {
  createConfig() {
    const loadConfig = require('load-config-file');
    loadConfig.register('.json', JSON.parse);
    const json = loadConfig('config');

    const app = joi.attempt(json.app ?? {}, schemas.appSchema);
    const biscoint = joi.attempt(json.biscoint ?? {}, schemas.biscointSchema);
    const papertrail = joi.attempt(
      json.papertrail ?? {},
      schemas.papertrailSchema,
    );
    const rabbitmq = joi.attempt(json.rabbitmq ?? {}, schemas.rabbitMqSchema);
    const telegram = joi.attempt(json.telegram ?? {}, schemas.telegramSchema);

    return {
      app: app,
      biscoint: biscoint,
      papertrail: papertrail,
      rabbitmq: rabbitmq,
      telegram: telegram,
    };
  }
}

const config = new AppConfigService();
export default config;
