const { request, run } = require('./redsms.cjs');

run(() => {
  const args = process.argv.slice(2);
  if (args.length === 0) return request('GET', 'client/info');
  // Compatibility with the original command-line examples.
  if (args.length === 1 && args[0] === 'send') return require('./send_sms.cjs').sendSms();
  if (args.length === 2 && args[0] === 'status') return require('./message_status.cjs').messageStatus(args[1]);
  throw new Error('Использование: node client_info.cjs');
});
