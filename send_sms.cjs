const { createHash, randomUUID } = require('node:crypto');

function required(name) {
  if (!process.env[name]) throw new Error('Задайте ' + name);
  return process.env[name];
}

async function main() {
  if (process.argv.length !== 2) {
    throw new Error('Использование: node send_sms.cjs');
  }
  const url = new URL('https://cp.redsms.ru/api/message');
  const fields = { from: required('REDSMS_FROM'), route: 'sms',
    text: 'Тестовое сообщение от redsms.ru', to: required('REDSMS_TO') };
  const params = new URLSearchParams(fields);
  const values = Object.keys(fields).sort().map(key => fields[key]).join('');
  const ts = randomUUID();
  const sig = createHash('md5').update(values + ts + required('REDSMS_API_KEY')).digest('hex');
  const response = await fetch(url, {
    method: 'POST', headers: { login: required('REDSMS_LOGIN'), ts, sig },
    body: params,
    signal: AbortSignal.timeout(15000), redirect: 'error',
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${body}`);
  const data = JSON.parse(body);
  console.log(JSON.stringify(data, null, 2));
  if (!data.success || data.errors?.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
