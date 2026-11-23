const { createHash, randomUUID } = require('node:crypto');

function required(name) {
  if (!process.env[name]) throw new Error('Задайте ' + name);
  return process.env[name];
}

async function request(method, path, fields = {}) {
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

function run(action) {
  Promise.resolve().then(action).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { request, required, run };
