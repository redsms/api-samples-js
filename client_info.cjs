const { createHash, randomUUID } = require('node:crypto');

function required(name) {
  if (!process.env[name]) throw new Error('Задайте ' + name);
  return process.env[name];
}

async function main(args) {
  let path = 'client/info';
  let method = 'GET';
  const fields = {};
  if (args.length === 1 && args[0] === 'send') {
    path = 'message';
    method = 'POST';
    Object.assign(fields, {
      from: required('REDSMS_FROM'), route: 'sms',
      text: 'Тестовое сообщение от redsms.ru', to: required('REDSMS_TO'),
    });
  } else if (args.length === 2 && args[0] === 'status' && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(args[1])) {
    path = 'message/' + args[1];
    fields.fields = 'uuid,status,errCode';
  } else if (args.length) {
    throw new Error('Использование: node client_info.cjs [send | status UUID]');
  }

  const ts = randomUUID();
  const values = Object.keys(fields).sort().map(key => fields[key]).join('');
  const sig = createHash('md5').update(values + ts + required('REDSMS_API_KEY')).digest('hex');
  const url = new URL('https://cp.redsms.ru/api/' + path);
  const params = new URLSearchParams(fields);
  if (method === 'GET') url.search = params.toString();
  const response = await fetch(url, {
    method, headers: { login: required('REDSMS_LOGIN'), ts, sig },
    body: method === 'POST' ? params : undefined,
    signal: AbortSignal.timeout(15000), redirect: 'error',
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${body}`);
  const data = JSON.parse(body);
  console.log(JSON.stringify(data, null, 2));
  if (!data.success || data.errors?.length) process.exitCode = 1;
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
