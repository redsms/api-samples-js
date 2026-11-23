const { createHash, randomUUID } = require('node:crypto');

function required(name) {
  if (!process.env[name]) throw new Error('Задайте ' + name);
  return process.env[name];
}

async function main() {
  if (process.argv.length !== 3) {
    throw new Error('Использование: node message_status.cjs UUID');
  }
  const uuid = process.argv[2] ?? '';
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(uuid)) {
    throw new Error('Укажите UUID: node message_status.cjs UUID');
  }
  const url = new URL('https://cp.redsms.ru/api/message/' + uuid);
  const values = 'uuid,status,errCode';
  url.searchParams.set('fields', values);
  const ts = randomUUID();
  const sig = createHash('md5').update(values + ts + required('REDSMS_API_KEY')).digest('hex');
  const response = await fetch(url, {
    method: 'GET', headers: { login: required('REDSMS_LOGIN'), ts, sig },
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
