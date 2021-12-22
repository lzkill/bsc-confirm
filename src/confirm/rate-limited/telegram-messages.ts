const emoji = require('node-emoji');

export function formatWelcomeMessage() {
  const prefix = `${emoji.get(':dollar:')} `;
  return `${prefix}Welcome to the ${bold('Biscoint Confirm Service')}!`;
}

export function formatHelpMessage() {
  const prefix = emoji.get(':bulb:');
  return `${prefix}${bold('Available commands:')}

  - /bcs_start nothing really useful
  - /bcs_enable enable the service
  - /bcs_disable disable the service
  - /bcs_config get the service config
  - /bcs_ping pong back
  - /bcs_help show this message`;
}

export function formatServiceEnabledMessage() {
  const message = 'Service enabled';
  return formatGeneralInfoMessage(message);
}

export function formatServiceDisabledMessage() {
  const message = 'Service disabled';
  return formatGeneralInfoMessage(message);
}

export function formatPingMessage() {
  const message = 'Pong';
  return formatGeneralInfoMessage(message);
}

export function formatGeneralInfoMessage(message: string) {
  const prefix = emoji.get(':grey_exclamation:');
  return `${prefix}${message}`;
}

function bold(text: string) {
  return `<b>${text}</b>`;
}
