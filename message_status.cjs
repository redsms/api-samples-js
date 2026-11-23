const { request, run } = require('./redsms.cjs');

function messageStatus(uuid = '') {
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(uuid)) {
    throw new Error('Укажите UUID: node message_status.cjs UUID');
  }
  return request('GET', 'message/' + uuid, { fields: 'uuid,status,errCode' });
}

if (require.main === module) run(() => {
  if (process.argv.length !== 3) throw new Error('Использование: node message_status.cjs UUID');
  return messageStatus(process.argv[2]);
});
module.exports = { messageStatus };
