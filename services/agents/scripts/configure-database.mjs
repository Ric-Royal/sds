import { readFileSync, writeFileSync } from 'node:fs';
const id = process.argv[2];
if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id || '') || id.startsWith('00000000'))
  throw new Error('Pass the database_id returned by wrangler d1 create.');
const path = new URL('../wrangler.jsonc', import.meta.url);
const config = JSON.parse(readFileSync(path, 'utf8'));
config.d1_databases[0].database_id = id;
writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
