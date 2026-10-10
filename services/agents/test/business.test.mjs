import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../src/worker.mjs';
import { runBusiness, runSchedules, runMonitors } from '../src/business.mjs';
import { runWebhook, cryptSecret, fetchSource, verifyStripe, validateFiles, gmail, openPullRequest, stripeCheckout } from '../src/integrations.mjs';
import { hmac, sql, stamp, sha } from '../src/common.mjs';
import { googleAuthorise, googleCallback } from '../src/google-oauth.mjs';
import { crc32, zip } from '../src/archive.mjs';
import { reservation } from '../src/provider.mjs';
class DB {
 constructor(){this.sql=new DatabaseSync(':memory:');for(const n of ['0001_operations.sql','0002_business.sql'])this.sql.exec(readFileSync(new URL('../migrations/'+n,import.meta.url),'utf8'));}
 prepare(q){const stmt=this.sql.prepare(q);let args=[];return {bind(...a){args=a;return this;},async first(){return stmt.get(...args)??null;},async all(){return {results:stmt.all(...args)};},async run(){return {meta:{changes:Number(stmt.run(...args).changes)}};}};}
 async batch(statements){this.sql.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());this.sql.exec('COMMIT');return r;}catch(e){this.sql.exec('ROLLBACK');throw e;}}
}
const admin='owner-test-'.padEnd(40,'a');const env=()=>({DB:new DB(),ADMIN_TOKEN:admin,AI_ENABLED:'false',MONTHLY_CAP_MICRO_USD:'10000000',PUBLIC_REGISTRATION:'true'});
async function call(e,path,method='GET',value,token=admin,key=crypto.randomUUID(),headers={}){const r=await worker.fetch(new Request('https://ops.example'+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','Idempotency-Key':key,...headers},body:value===undefined?undefined:JSON.stringify(value)}),e);const v=r.headers.get('Content-Type')?.includes('application/json')?await r.json():await r.text();return {status:r.status,value:v,headers:r.headers};}
async function customer(e,name='Customer A'){const r=await call(e,'/v2/register','POST',{name,email:name.replaceAll(' ','').toLowerCase()+'@example.com',consent:true},'',crypto.randomUUID(),{'CF-Connecting-IP':name});assert.equal(r.status,201);return {id:r.value.id,token:r.value.access_key};}
const quality={title:'Quarterly sales assessment',service:'data-quality',brief:'Find duplicates and missing values for the operations team this week.',input:{rows:[{name:'A',amount:10},{name:'A',amount:10},{name:'',amount:null}]}};
async function project(e,c,value=quality,key='project-request-001'){const r=await call(e,'/v2/projects','POST',value,c.token,key);assert.equal(r.status,202);return r.value;}
async function quote(e,p,amount=0){const r=await call(e,`/v2/projects/${p.id}/quote`,'POST',{currency:'KES',amount_minor:amount,scope:'Assess the supplied sample and deliver field statistics.',terms:'Agreed scope. Synthetic verification work.'});assert.equal(r.status,201);return r.value;}
async function accept(e,c,p,q){const r=await call(e,`/v2/projects/${p.id}/accept`,'POST',{quote_id:q.id,accepted:true},c.token);assert.equal(r.status,200);return r.value;}
async function finish(e,p,provider){for(let i=0;i<15;i++){await runBusiness(e,provider);const x=(await call(e,'/v2/projects/'+p.id)).value;if(['review','blocked','delivered'].includes(x.state))return x;}throw new Error('Workflow did not finish.');}
const model=()=>async(_url,o)=>{const input=JSON.parse(o.body);const context=JSON.parse(input.messages[1].content);assert.ok(input.response_format);return Response.json({choices:[{message:{content:JSON.stringify({summary:'Analysis for '+context.project.title,sections:[{title:'Evidence and implementation',body:'Concrete project analysis using the supplied brief.'}],findings:['Finding'],actions:['Action'],questions:[],source_ids:context.sources.map(s=>s.id)})},finish_reason:'stop'}],usage:{prompt_tokens:300,completion_tokens:100}});};
test('complete customer contract, workflow, review, JSON result and hashed files',async()=>{
 const e=env(),c=await customer(e),other=await customer(e,'Customer B'),p=await project(e,c);
 assert.equal((await call(e,'/v2/projects/'+p.id,'GET',undefined,other.token)).status,404);
 assert.equal((await call(e,'/v2/projects/'+p.id+'/release','POST',undefined,c.token)).status,403);
 await runBusiness(e);const q=await quote(e,p);await accept(e,c,p,q);const finished=await finish(e,p);assert.equal(finished.state,'review');
 const hidden=(await call(e,'/v2/projects/'+p.id,'GET',undefined,c.token)).value;assert.equal(hidden.result,undefined);assert.equal(hidden.deliverables.length,0);assert.ok(hidden.tasks.every(t=>!t.output));
 assert.equal((await call(e,'/v2/projects/'+p.id+'/release','POST')).status,200);const result=(await call(e,'/v2/projects/'+p.id,'GET',undefined,c.token)).value;
 assert.equal(result.state,'delivered');const assessment=result.result.results.find(t=>t.engine==='data-quality').result;assert.equal(assessment.duplicate_rows,1);assert.equal(result.deliverables.length,4);
 const file=result.deliverables.find(x=>x.name==='report.json');const downloaded=await call(e,file.url,'GET',undefined,c.token);assert.equal(downloaded.status,200);assert.equal(downloaded.headers.get('SDS-Content-SHA256'),file.sha256);
 assert.equal((await call(e,file.url,'GET',undefined,other.token)).status,404);assert.equal((await call(e,'/v2/projects/'+p.id+'/release','POST')).status,409);
});
test('payment requires acceptance, exact currency, verified receipt and full settlement',async()=>{
 const e=env(),c=await customer(e),p=await project(e,c),q=await quote(e,p,10000);
 assert.equal((await call(e,'/v2/projects/'+p.id+'/receipt','POST',{reference:'receipt1',currency:'KES',amount_minor:10000})).status,409);
 await accept(e,c,p,q);assert.equal((await call(e,'/v2/projects/'+p.id+'/receipt','POST',{reference:'receipt1',currency:'USD',amount_minor:10000})).status,400);
 const value={reference:'receipt1',currency:'KES',amount_minor:4000};assert.equal((await call(e,'/v2/projects/'+p.id+'/receipt','POST',value)).status,201);
 assert.equal((await call(e,'/v2/projects/'+p.id+'/receipt','POST',value)).status,201);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM payments').get().n,1);
 assert.equal((await call(e,'/v2/projects/'+p.id)).value.state,'awaiting_payment');
 await call(e,'/v2/projects/'+p.id+'/receipt','POST',{reference:'receipt2',currency:'KES',amount_minor:6000});assert.equal((await call(e,'/v2/projects/'+p.id)).value.state,'active');
 assert.equal((await call(e,'/v2/projects/'+p.id+'/quote','POST',{currency:'KES',amount_minor:0,scope:'New',terms:'New'})).status,409);
});
test('quote revisions reject stale and expired acceptance without starting work',async()=>{
 const e=env(),c=await customer(e),p=await project(e,c),a=await quote(e,p,500),b=await quote(e,p,1000);
 assert.equal((await call(e,'/v2/projects/'+p.id+'/accept','POST',{quote_id:a.id,accepted:true},c.token)).status,400);
 await sql(e,'UPDATE quotes SET expires_at=? WHERE id=?','2000-01-01T00:00:00.000Z',b.id).run();
 assert.equal((await call(e,'/v2/projects/'+p.id+'/accept','POST',{quote_id:b.id,accepted:true},c.token)).status,409);assert.equal((await call(e,'/v2/projects/'+p.id)).value.state,'awaiting_acceptance');
});
test('project idempotency, CSV quoted cells, changed input conflict and row limits',async()=>{
 const e=env(),c=await customer(e);const value={...quality,input:{csv:'name,amount\r\n"A, B",10\r\n"A, B",10\r\nC,\r\n'}};
 const p=await project(e,c,value);const replay=await call(e,'/v2/projects','POST',value,c.token,'project-request-001');assert.equal(replay.status,200);assert.equal(replay.value.id,p.id);
 assert.equal((await call(e,'/v2/projects','POST',{...value,title:'Changed'},c.token,'project-request-001')).status,409);
 assert.equal((await call(e,'/v2/projects','POST',{...quality,input:{rows:Array.from({length:5001},()=>({x:1}))}},c.token,'project-oversized')).status,400);
});
test('AI roles coordinate shared context, rework instructions, budget and model output gate',async()=>{
 const e={...env(),AI_ENABLED:'true',AI_API_KEY:'fake-test-key',AI_BASE_URL:'https://provider.example/v1',AI_MODEL:'test-json',INPUT_USD_PER_MILLION:'0.4',OUTPUT_USD_PER_MILLION:'1.6'};
 const r=await call(e,'/v2/projects','POST',{title:'SDS campaign',service:'marketing-campaign',brief:'Prepare a campaign from these verified facts.',input:{context:'SDS provides analytics.',roles:['research','marketing','quality']},internal:true});const p=r.value;
 let calls=0,contexts=[];const provider=async(u,o)=>{calls++;contexts.push(JSON.parse(JSON.parse(o.body).messages[1].content));return model()(u,o);};
 const result=await finish(e,p,provider);assert.equal(result.state,'review');assert.equal(calls,3);assert.equal(contexts[1].prior.length,1);assert.equal(contexts[2].prior.length,2);assert.ok(e.DB.sql.prepare('SELECT sum(reservation_micro_usd) n FROM tasks').get().n>0);
 await call(e,'/v2/projects/'+p.id+'/rework','POST',{role:'marketing',instruction:'Add three actual email drafts.'});const revised=await finish(e,p,provider);assert.equal(revised.state,'review');assert.equal(contexts.at(-1).task_instruction,'Add three actual email drafts.');
});
test('model tasks wait when disabled; failures retain allocations and never retry automatically',async()=>{
 const e=env(),c=await customer(e),p=await project(e,c,{title:'Evidence report',service:'research-report',brief:'Analyse supplied sources.',input:{context:'Facts'}});const q=await quote(e,p);await accept(e,c,p,q);await runBusiness(e);assert.equal((await runBusiness(e)).processed,false);
 Object.assign(e,{AI_ENABLED:'true',AI_API_KEY:'test-key',AI_BASE_URL:'https://provider.example/v1',AI_MODEL:'test-json',INPUT_USD_PER_MILLION:'0.4',OUTPUT_USD_PER_MILLION:'1.6'});
 let calls=0;const failed=async()=>{calls++;return new Response('provider-secret-data',{status:500});};const r=await runBusiness(e,failed);assert.equal(r.state,'blocked');await runBusiness(e,failed);assert.equal(calls,1);assert.ok(e.DB.sql.prepare('SELECT reserved_micro_usd n FROM budget').get().n>0);assert.ok(!JSON.stringify((await call(e,'/v2/projects/'+p.id)).value).includes('provider-secret-data'));
 assert.equal((await call(e,'/v2/projects/'+p.id+'/retry','POST',{task_id:r.task_id})).status,400);
});
test('concurrent workers claim a task once and paid budget cap applies before request',async()=>{
 const e={...env(),AI_ENABLED:'true',AI_API_KEY:'test',AI_BASE_URL:'https://provider.example/v1',AI_MODEL:'test-json',INPUT_USD_PER_MILLION:'0.4',OUTPUT_USD_PER_MILLION:'1.6',MONTHLY_CAP_MICRO_USD:'1'};
 const p=(await call(e,'/v2/projects','POST',{title:'Research',service:'research-report',brief:'Use source evidence.',internal:true})).value;
 let calls=0;await Promise.all([runBusiness(e,async()=>{calls++;}),runBusiness(e,async()=>{calls++;})]);assert.equal(calls,0);assert.equal((await call(e,'/v2/projects/'+p.id)).value.state,'blocked');
});
test('scheduled work does not duplicate outstanding projects and monitors record incidents',async()=>{
 const e=env();await call(e,'/v2/schedules','POST',{name:'Weekly campaign',service:'marketing-campaign',brief:'Write this week content from approved facts.',interval_hours:168});await Promise.all([runSchedules(e),runSchedules(e)]);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM projects').get().n,1);
 await sql(e,"UPDATE schedules SET next_run_at='2000-01-01'").run();await runSchedules(e);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM projects').get().n,1);
 await call(e,'/v2/monitors','POST',{name:'SDS site',url:'https://datasds.org',interval_minutes:30});await runMonitors(e,async()=>new Response('down',{status:503}));assert.equal(e.DB.sql.prepare('SELECT state FROM monitors').get().state,'down');assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM projects WHERE service='maintenance-review'").get().n,1);
 await sql(e,"UPDATE monitors SET next_run_at='2000-01-01'").run();await runMonitors(e,async()=>new Response('still down',{status:503}));assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM projects WHERE service='maintenance-review'").get().n,1);
 await sql(e,"UPDATE monitors SET next_run_at='2000-01-01'").run();await runMonitors(e,async()=>new Response('ok'));assert.equal(e.DB.sql.prepare('SELECT state FROM monitors').get().state,'healthy');
});
test('webhooks encrypt secrets, sign payloads, preserve event ID and back off failures',async()=>{
 const e=env(),c=await customer(e),p=await project(e,c),q=await quote(e,p);await accept(e,c,p,q);await finish(e,p);
 await call(e,'/v2/policy','PUT',{outbound_hosts:['customer.example.com']});const secret='customer-signing-secret'.padEnd(40,'x');assert.equal((await call(e,'/v2/webhook','POST',{url:'https://customer.example.com/events',secret},c.token)).status,200);const stored=e.DB.sql.prepare('SELECT secret FROM webhook_subscriptions').get().secret;assert.ok(!stored.includes(secret));assert.equal(await cryptSecret(e,stored,true),secret);
 await call(e,'/v2/projects/'+p.id+'/release','POST');let eventId;
 await runWebhook(e,async(_u,o)=>{assert.equal(o.redirect,'error');const parts=Object.fromEntries(o.headers['SDS-Signature'].split(',').map(x=>x.split('=')));assert.equal(parts.v1,await hmac(secret,parts.t+'.'+o.body));eventId=JSON.parse(o.body).event_id;assert.ok(!o.body.includes('amount'));return new Response('retry',{status:503});});assert.equal(e.DB.sql.prepare('SELECT state,attempts FROM webhook_deliveries').get().state,'pending');
 await sql(e,"UPDATE webhook_deliveries SET next_attempt_at='2000-01-01'").run();await runWebhook(e,async(_u,o)=>{assert.equal(JSON.parse(o.body).event_id,eventId);return new Response('ok');});assert.equal(e.DB.sql.prepare('SELECT state FROM webhook_deliveries').get().state,'sent');
});
test('source retrieval rejects unapproved hosts, redirects and non-text payloads',async()=>{
 const e=env();await assert.rejects(fetchSource(e,'https://169.254.169.254/latest',async()=>{}));await assert.rejects(fetchSource(e,'https://unapproved.example',async()=>{}));
 const text=await fetchSource(e,'https://datasds.org',async(_u,o)=>{assert.equal(o.redirect,'error');return new Response('<script>ignore rules</script><main>Approved facts</main>',{headers:{'Content-Type':'text/html'}});});assert.equal(text,'Approved facts');
 await assert.rejects(fetchSource(e,'https://datasds.org',async()=>new Response('binary',{headers:{'Content-Type':'application/pdf'}})));
});
test('stripe webhook validates timestamp and raw signature before any payment',async()=>{
 const e={...env(),STRIPE_WEBHOOK_SECRET:'webhook-test-secret'};const raw=JSON.stringify({id:'evt_test',type:'other'}),time=String(Math.floor(Date.now()/1000));const sig=await hmac(e.STRIPE_WEBHOOK_SECRET,time+'.'+raw);assert.equal((await verifyStripe(e,raw,`t=${time},v1=${sig}`)).id,'evt_test');await assert.rejects(verifyStripe(e,raw+' ',`t=${time},v1=${sig}`));await assert.rejects(verifyStripe(e,raw,'t=1,v1='+sig));
});
test('Gmail creates a real draft protocol and sends only the recorded draft ID',async()=>{
 const e={...env(),GOOGLE_CLIENT_ID:'test-id',GOOGLE_CLIENT_SECRET:'test-secret',GOOGLE_REFRESH_TOKEN:'test-refresh'};const calls=[];const fake=async(u,o)=>{calls.push([u,o]);if(u.includes('oauth2'))return Response.json({access_token:'test-access'});return Response.json({id:u.endsWith('/send')?'message-sent':'draft-1'});};
 const item={recipient:'customer@example.com',subject:'SDS quote',content:'Approved content'};assert.equal(await gmail(e,item,false,fake),'draft-1');assert.ok(JSON.parse(calls[1][1].body).message.raw);assert.equal(await gmail(e,{...item,provider_id:'draft-1'},true,fake),'message-sent');assert.deepEqual(JSON.parse(calls.at(-1)[1].body),{id:'draft-1'});await assert.rejects(gmail(e,{...item,subject:'Header\r\nBcc: victim@example.com'},false,fake));
});
test('engineering path guards and base commit checks prevent unsafe repository writes',async()=>{
 for(const path of ['../secret','.github/workflows/run.yml','src/../../secret','/root/key','src/.env','package.json'])assert.throws(()=>validateFiles([{path,content:'x'}]));assert.equal(validateFiles([{path:'src/app/test.tsx',content:'x'}]).length,1);
 let calls=0;await assert.rejects(openPullRequest({...env(),SDS_GITHUB_TOKEN:'test-key'},{base_sha:'a'.repeat(40),files:JSON.stringify([{path:'src/test.ts',content:'x'}])},async()=>{calls++;return Response.json({object:{sha:'b'.repeat(40)}});}));assert.equal(calls,1);
});
test('MCP tools enforce ownership and use the same ordering contract',async()=>{
 const e=env(),c=await customer(e);const tools=await call(e,'/mcp','POST',{jsonrpc:'2.0',id:1,method:'tools/list'},c.token);assert.ok(tools.value.result.tools.some(t=>t.name==='sds_create_project'));
 const result=await call(e,'/mcp','POST',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'sds_create_project',arguments:{...quality,idempotency_key:'mcp-request-001'}}},c.token);assert.equal(result.value.result.isError,false);const id=result.value.result.structuredContent.id;
 const other=await customer(e,'Another customer');const denied=await call(e,'/mcp','POST',{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'sds_get_project',arguments:{project_id:id}}},other.token);assert.equal(denied.value.result.isError,true);
});
test('public intake consent, request limits, CORS and administrator-only controls',async()=>{
 const e=env();assert.equal((await call(e,'/v2/register','POST',{name:'A',email:'a@example.com'},'')).status,400);
 const r=await call(e,'/v2/enquiries','POST',{name:'New lead',email:'lead@example.com',consent:true,title:'Dashboard',service:'analytics-plan',brief:'Scope a board dashboard.'},'',crypto.randomUUID(),{'Origin':'https://datasds.org'});assert.equal(r.status,202);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://datasds.org');assert.equal(r.value.project.state,'enquiry');
 const c={id:r.value.id,token:r.value.access_key};assert.equal((await call(e,'/v2/policy','PUT',{auto_release_services:['data-quality']},c.token)).status,403);
 const forbidden=await call(e,'/v2/catalogue','GET',undefined,'','cors-check',{'Origin':'https://attacker.example'});assert.equal(forbidden.headers.get('Access-Control-Allow-Origin'),null);
 for(let i=0;i<3;i++)await call(e,'/v2/register','POST',{name:'A',email:'a@example.com',consent:true},'',crypto.randomUUID(),{'CF-Connecting-IP':'rate'});assert.equal((await call(e,'/v2/register','POST',{name:'A',email:'a@example.com',consent:true},'',crypto.randomUUID(),{'CF-Connecting-IP':'rate'})).status,429);
});
test('project erasure removes work content and retains commercial records',async()=>{
 const e=env(),c=await customer(e),p=await project(e,c),q=await quote(e,p);await accept(e,c,p,q);await finish(e,p);await call(e,'/v2/projects/'+p.id+'/release','POST');
 assert.equal((await call(e,'/v2/projects/'+p.id+'/erase','POST',{confirm_project_id:p.id})).status,200);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM deliverables').get().n,0);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM quotes').get().n,1);assert.equal((await call(e,'/v2/projects/'+p.id)).value.brief,'Content erased');
});


test('registration retries recover the same private key but cannot bypass revocation',async()=>{
 const e=env(),id=crypto.randomUUID(),details={name:'New customer',email:'new@example.com',consent:true};
 const a=await call(e,'/v2/register','POST',details,'',id),b=await call(e,'/v2/register','POST',details,'',id);assert.equal(a.status,201);assert.equal(b.value.access_key,a.value.access_key);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM clients').get().n,1);
 assert.equal((await call(e,'/v2/register','POST',{...details,name:'Changed'},'',id)).status,409);
 await call(e,'/v2/customers/'+a.value.id+'/revoke','POST');assert.equal((await call(e,'/v2/register','POST',details,'',id)).status,409);
});
test('Google authorisation uses expiring PKCE state, encrypted offline access and replay rejection',async()=>{
 const e={...env(),GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'fake-private-secret'},auth=await googleAuthorise(e,'https://ops.example'),url=new URL(auth.url),state=url.searchParams.get('state');assert.equal(url.hostname,'accounts.google.com');assert.equal(url.searchParams.get('code_challenge_method'),'S256');assert.equal(url.searchParams.get('scope'),'https://www.googleapis.com/auth/gmail.compose');
 const row=e.DB.sql.prepare('SELECT * FROM oauth_states').get();assert.notEqual(row.key_hash,state);assert.notEqual(row.verifier,await cryptSecret(e,row.verifier,true));
 const request=new Request('https://ops.example/v2/google/callback?'+new URLSearchParams({state,code:'fake-code'}));let exchanges=0;
 const response=await googleCallback(request,e,async(u,o)=>{exchanges++;assert.equal(u,'https://oauth2.googleapis.com/token');assert.ok(o.body.get('code_verifier'));return Response.json({refresh_token:'private-refresh'});});assert.equal(response.status,303);
 const stored=e.DB.sql.prepare('SELECT value FROM integrations').get().value;assert.notEqual(stored,'private-refresh');assert.equal(await cryptSecret(e,stored,true),'private-refresh');await assert.rejects(()=>googleCallback(request,e),/expired/);assert.equal(exchanges,1);
 assert.equal((await call(e,'/v2/google/authorize','POST',undefined,(await customer(e)).token)).status,403);
});
test('live research reserves search cost, records returned sources and passes evidence to later roles',async()=>{
 const e={...env(),AI_ENABLED:'true',AI_API_KEY:'test',AI_BASE_URL:'https://api.openai.com/v1',AI_MODEL:'gpt-4.1-mini-2025-04-14',WEB_SEARCH_ENABLED:'true',INPUT_USD_PER_MILLION:'0.4',OUTPUT_USD_PER_MILLION:'1.6'};
 const p=(await call(e,'/v2/projects','POST',{title:'Research decision',service:'research-report',brief:'Research this decision using first-party sources.',input:{roles:['research','quality']},internal:true})).value;
 let searches=0,supplied=[];const provider=async(u,o)=>{const b=JSON.parse(o.body);if(u.endsWith('/responses')){searches++;assert.equal(b.max_tool_calls,1);assert.equal(b.store,false);return Response.json({status:'completed',output:[{type:'web_search_call',action:{sources:[{title:'Evidence',url:'https://developers.cloudflare.com/workers/'}]}},{type:'message',content:[{type:'output_text',text:'Evidence supports the proposed decision.',annotations:[]}]}]});}supplied.push(JSON.parse(b.messages[1].content));return model()(u,o);};
 const completed=await finish(e,p,provider);assert.equal(completed.state,'review');assert.equal(searches,1);assert.equal(supplied[0].sources[0].url,'https://developers.cloudflare.com/workers/');assert.ok(e.DB.sql.prepare("SELECT reservation_micro_usd n FROM tasks WHERE engine='web-search'").get().n>=13200);
 const html=e.DB.sql.prepare("SELECT content FROM deliverables WHERE name='report.html'").get().content;assert.ok(html.includes('<a href="https://developers.cloudflare.com/workers/"'));
});
test('engineering delivery contains a binary ZIP with verified hash and proposed implementation manifest',async()=>{
 assert.equal(crc32(new TextEncoder().encode('123456789')),0xcbf43926);
 const e={...env(),AI_ENABLED:'true',AI_API_KEY:'test',AI_BASE_URL:'https://provider.example/v1',AI_MODEL:'test-json',INPUT_USD_PER_MILLION:'0.4',OUTPUT_USD_PER_MILLION:'1.6'};
 const p=(await call(e,'/v2/projects','POST',{title:'Build requested application',service:'system-build',brief:'Build an implementation.',input:{roles:['engineering']},internal:true})).value;
 const completed=await finish(e,p,async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({summary:'Implementation',sections:[{title:'Build',body:'Implementation and testing instructions.'}],files:[{path:'package.json',content:'{"name":"customer-app"}'},{path:'src/index.js',content:'console.log("SDS");'}]})}}]}));assert.equal(completed.state,'review');
 const metadata=completed.deliverables.find(x=>x.name==='implementation.zip');assert.ok(metadata);const response=await worker.fetch(new Request('https://ops.example'+metadata.url,{headers:{Authorization:'Bearer '+admin}}),e);const bytes=new Uint8Array(await response.arrayBuffer());assert.equal(new DataView(bytes.buffer).getUint32(0,true),0x04034b50);assert.equal(await sha(bytes),metadata.sha256);assert.ok(completed.result.delivery_formats.includes('application/zip'));assert.throws(()=>validateFiles([{path:'.env.production',content:'secret'}],{repository:false}));
});
test('Stripe checkout and signed event settle only the recorded accepted quote',async()=>{
 const e={...env(),STRIPE_SECRET_KEY:'fake-stripe',STRIPE_WEBHOOK_SECRET:'webhook-test'},c=await customer(e),p=await project(e,c),q=await quote(e,p,5000);await accept(e,c,p,q);let creates=0;
 const session=await stripeCheckout(e,p,q,'https://ops.example',async(u,o)=>{creates++;assert.equal(o.body.get('line_items[0][price_data][unit_amount]'),'5000');assert.equal(o.headers['Idempotency-Key'],'sds-quote-'+q.id);return Response.json({id:'cs_test',url:'https://checkout.stripe.com/test',expires_at:Math.floor(Date.now()/1000)+3600});});assert.equal((await stripeCheckout(e,p,q,'https://ops.example')).provider_id,session.provider_id);assert.equal(creates,1);
 const payload={id:'evt_test',type:'checkout.session.completed',data:{object:{id:'cs_test',payment_status:'paid',metadata:{project_id:p.id,quote_id:q.id},currency:'kes',amount_total:5000}}};const raw=JSON.stringify(payload),time=String(Math.floor(Date.now()/1000)),signature='t='+time+',v1='+await hmac(e.STRIPE_WEBHOOK_SECRET,time+'.'+raw);
 const request=()=>new Request('https://ops.example/v2/payments/stripe/webhook',{method:'POST',headers:{'Stripe-Signature':signature},body:raw});assert.equal((await worker.fetch(request(),e)).status,200);assert.equal((await worker.fetch(request(),e)).status,200);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM payments').get().n,1);assert.equal((await call(e,'/v2/projects/'+p.id)).value.state,'active');
});
test('website publishing requires approval and excludes private customer projects',async()=>{
 const e=env(),c=await customer(e),p=await project(e,c),article={title:'SDS article',summary:'Approved summary',content:'Public article content.'};
 assert.equal((await call(e,'/v2/publications','POST',{...article,approved:true},c.token)).status,403);assert.equal((await call(e,'/v2/publications','POST',article)).status,400);assert.equal((await call(e,'/v2/publications','POST',{...article,approved:true,project_id:p.id})).status,400);assert.equal((await call(e,'/v2/publications','POST',{...article,approved:true})).status,201);
 const publicData=await call(e,'/v2/publications','GET',undefined,'');assert.equal(publicData.value.publications[0].content,article.content);assert.ok(!JSON.stringify(publicData.value).includes(admin));
});
test('MCP rejects unapproved browser origins while accepting authenticated server clients',async()=>{
 const e=env(),c=await customer(e);const request=origin=>new Request('https://ops.example/mcp',{method:'POST',headers:{Authorization:'Bearer '+c.token,'Content-Type':'application/json',...(origin?{Origin:origin}:{})},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize'})});
 assert.equal((await worker.fetch(request('https://attacker.example'),e)).status,403);assert.equal((await worker.fetch(request(),e)).status,200);assert.equal((await worker.fetch(request('https://datasds.org'),e)).status,200);
});
