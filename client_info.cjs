const { createHash, randomUUID } = require('node:crypto');

async function main() {
  const { REDSMS_LOGIN: login, REDSMS_API_KEY: key } = process.env;
  if (!login || !key) throw new Error('Задайте REDSMS_LOGIN и REDSMS_API_KEY');
  const ts = randomUUID();
  const sig = createHash('md5').update(ts + key, 'utf8').digest('hex');
  const response = await fetch('https://cp.redsms.ru/api/client/info', {
    headers: { login, ts, sig },
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${body}`);
  console.log(JSON.stringify(JSON.parse(body), null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
