import { writeFileSync } from 'node:fs';
import { catalogue } from '../src/catalogue.mjs';
const publicCatalogue = { ...catalogue, api: { status: 'Deployment pending',
  access: 'Contact contact@datasds.org for client access.', base_url: null },
  availability: 'Data-quality engine implemented. Model services require a configured provider.' };
writeFileSync(new URL('../../../public/agent-services.json', import.meta.url), JSON.stringify(publicCatalogue, null, 2) + '\n');
