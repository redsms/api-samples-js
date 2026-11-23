const { request, required, run } = require('./redsms.cjs');

function sendSms() {
  return request('POST', 'message', {
    route: 'sms',
    from: required('REDSMS_FROM'),
    to: required('REDSMS_TO'),
    text: 'Тестовое сообщение от redsms.ru',
  });
}

if (require.main === module) run(() => {
  if (process.argv.length !== 2) throw new Error('Использование: node send_sms.cjs');
  return sendSms();
});
module.exports = { sendSms };
