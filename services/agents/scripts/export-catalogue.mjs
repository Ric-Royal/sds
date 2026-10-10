import { writeFileSync } from 'node:fs';
import { roles, services } from '../src/services.mjs';
const base='https://sds-agent-operations.sds-9991a64282bd.workers.dev';
const publicCatalogue = { business:'SDS',schema_version:'2.0',website:'https://datasds.org',roles,services,
  api:{base_url:base,catalogue:base+'/v2/catalogue',openapi:base+'/openapi.json',mcp:base+'/mcp',submit:base+'/v2/projects',status:base+'/v2/projects/{id}',authentication:'Customer bearer access key',idempotency:'Idempotency-Key required'},
  portal:base+'/portal/',formats:['JSON','HTML','Markdown','CSV','ZIP implementation files'],
  availability:'Project ordering and deterministic assessments are live after deployment. Paid model tasks require the configured API key. Online payments and Google Workspace require their account connections.'};
writeFileSync(new URL('../../../public/agent-services.json', import.meta.url), JSON.stringify(publicCatalogue, null, 2) + '\n');
