import { sql, stamp, uid, sha, fail, event, policy } from './common.mjs';
import { service, inputFor } from './services.mjs';
import { assessRows } from './catalogue.mjs';
import { generate, researchSearch } from './provider.mjs';
import { buildDeliverables } from './deliverables.mjs';
import { enqueueNotification, runWebhook } from './integrations.mjs';

export async function createProject(env,actor,value,key,internal=false){
 const s=service(value.service);const title=value.title?.trim();const brief=value.brief?.trim();
 if(!title||title.length>160||!brief||brief.length>12000)fail(400,'Provide a title (1–160 characters) and brief (1–12,000 characters).');
 const input=inputFor(s.id,value.input??{});const encoded=JSON.stringify(input);if(new TextEncoder().encode(encoded).length>450000)fail(413,'Project input exceeds 450 KB.');
 for(const id of input.sources||[]){if(!await sql(env,'SELECT id FROM knowledge WHERE id=? AND approved=1',id).first())fail(400,'Project references a source that has not been approved.');}
 const fingerprint=await sha(JSON.stringify({service:s.id,title,brief,input}));const existing=await sql(env,'SELECT * FROM projects WHERE client_id=? AND idempotency_key=?',actor.id,key).first();
 if(existing){if(existing.fingerprint!==fingerprint)fail(409,'Idempotency key belongs to a different project.');return {project:existing,created:false};}
 const pending=await sql(env,"SELECT count(*) AS n FROM projects WHERE client_id=? AND state NOT IN('delivered','cancelled','archived')",actor.id).first();if(pending.n>=20)fail(429,'Outstanding project limit reached.');
 const id=uid(),time=stamp();
 await sql(env,'INSERT OR IGNORE INTO projects(id,client_id,title,service,brief,input,state,kind,payment_state,idempotency_key,fingerprint,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',id,actor.id,title,s.id,brief,encoded,internal?'active':'enquiry',internal?'internal':'customer',internal?'internal':'unquoted',key,fingerprint,time,time).run();
 const p=await sql(env,'SELECT * FROM projects WHERE client_id=? AND idempotency_key=?',actor.id,key).first();if(p.fingerprint!==fingerprint)fail(409,'Idempotency key belongs to a different project.');
 if(p.id===id){await event(env,id,'project_created',actor.id,{service:s.id,kind:p.kind});if(internal)await planProject(env,p);else await sql(env,'INSERT INTO tasks(id,project_id,position,role,engine,input,updated_at) VALUES(?,?,?,?,?,?,?)',uid(),id,0,'sales','qualification',JSON.stringify({}),time).run();}
 return {project:p,created:p.id===id};
}
export async function planProject(env,p){
 const s=service(p.service);const input=JSON.parse(p.input);let flow=input.roles?.length?input.roles.map(role=>({role,engine:role==='finance'?'finance':'model'})):s.flow;
 if(env.WEB_SEARCH_ENABLED==='true')flow=flow.flatMap(t=>t.role==='research'?[{role:'research',engine:'web-search'},t]:[t]);
 const offset=p.kind==='internal'?0:1;const rows=flow.map((t,i)=>sql(env,'INSERT OR IGNORE INTO tasks(id,project_id,position,role,engine,input,updated_at) VALUES(?,?,?,?,?,?,?)',uid(),p.id,i+offset,t.role,t.engine,'{}',stamp()));await env.DB.batch(rows);
}
export async function activateProject(env,p){
 if(p.kind!=='internal'){
  const q=await sql(env,"SELECT * FROM quotes WHERE id=? AND state='accepted'",p.quote_id).first();if(!q)fail(409,'An accepted quote is required.');
  const paid=await sql(env,'SELECT COALESCE(sum(amount_minor),0) AS n FROM payments WHERE quote_id=? AND currency=?',q.id,q.currency).first();if(q.amount_minor>paid.n)fail(409,'Payment is not settled.');
 }
 await planProject(env,p);await sql(env,"UPDATE projects SET state='active',payment_state=?,updated_at=? WHERE id=? AND state IN('awaiting_payment','awaiting_acceptance')",p.kind==='internal'?'internal':'settled',stamp(),p.id).run();
 await event(env,p.id,'workflow_started','chief-of-staff');
}
export async function recordPayment(env,p,q,{provider,reference,currency,amount_minor,actor}){
 if(q.id!==p.quote_id||q.state!=='accepted')fail(409,'Payment requires the current accepted quote.');
 if(currency!==q.currency||!Number.isSafeInteger(amount_minor)||amount_minor<=0||amount_minor>1000000000)fail(400,'Payment currency or amount is invalid.');
 const duplicate=await sql(env,'SELECT * FROM payments WHERE reference=?',reference).first();
 if(duplicate){if(duplicate.quote_id!==q.id||duplicate.amount_minor!==amount_minor||duplicate.currency!==currency)fail(409,'Payment reference belongs to a different receipt.');return duplicate;}
 const id=uid();await sql(env,'INSERT OR IGNORE INTO payments(id,project_id,quote_id,provider,reference,currency,amount_minor,actor,created_at) VALUES(?,?,?,?,?,?,?,?,?)',id,p.id,q.id,provider,reference,currency,amount_minor,actor,stamp()).run();
 const stored=await sql(env,'SELECT * FROM payments WHERE reference=?',reference).first();if(stored.quote_id!==q.id||stored.amount_minor!==amount_minor||stored.currency!==currency)fail(409,'Payment reference belongs to a different receipt.');
 if(stored.id===id)await event(env,p.id,'payment_recorded',actor,{payment_id:id,provider,amount_minor,currency});
 const paid=await sql(env,'SELECT sum(amount_minor) AS n FROM payments WHERE quote_id=? AND currency=?',q.id,currency).first();
 if(paid.n>=q.amount_minor&&['awaiting_payment','awaiting_acceptance'].includes(p.state))await activateProject(env,p);else if(paid.n<q.amount_minor)await sql(env,"UPDATE projects SET payment_state='partial',updated_at=? WHERE id=?",stamp(),p.id).run();
 return stored;
}
function qualification(p){
 const brief=p.brief;return {summary:'Enquiry recorded and routed to '+service(p.service).title+'.',sections:[{title:'Requested outcome',body:brief}],
  findings:[`Service: ${p.service}.`,p.service==='data-quality'?`Supplied sample: ${JSON.parse(p.input).rows.length} records.`:'Scope requires an approved quote.'],
  questions:[...(!/\b(day|week|month|deadline|by |before )/i.test(brief)?['What is the required delivery date?']:[]),...(!/\b(user|team|manager|customer|board|director)/i.test(brief)?['Who will use the result and what decision will it support?']:[]), 'Confirm data access, permitted use, acceptance criteria and commercial terms.'],
  actions:['Prepare a priced scope for approval. No binding price has been inferred.']};
}
async function contextFor(env,p,task){
 const input=JSON.parse(p.input);const prior=(await sql(env,"SELECT role,engine,output FROM tasks WHERE project_id=? AND position<? AND state='complete' ORDER BY position",p.id,task.position).all()).results.map(t=>({role:t.role,result:JSON.parse(t.output)}));
 const sources=[];for(const id of input.sources||[]){const source=await sql(env,'SELECT id,title,url,text,fetched_at FROM knowledge WHERE id=? AND approved=1',id).first();if(source)sources.push(source);}
 for(const t of prior)for(const source of t.result.evidence||[])if(!sources.some(x=>x.id===source.id))sources.push(source);
 return {project:{id:p.id,title:p.title,service:p.service,brief:p.brief,context:input.context??''},task_instruction:JSON.parse(task.input).instruction??null,prior,sources};
}
async function deterministic(env,p,task){
 if(task.engine==='qualification')return qualification(p);
 if(task.engine==='intake')return {summary:'Chief of Staff validated the request and assigned delivery, quality and governance stages.',sections:[{title:'Customer objective',body:p.brief}],actions:['Assess supplied data, check the findings and prepare the report package.']};
 if(task.engine==='data-quality'){const result=assessRows(JSON.parse(p.input).rows,5000);return {...result,summary:`Assessed ${result.row_count} records and ${result.fields.length} fields; found ${result.duplicate_rows} duplicate rows.`,sections:[]};}
 if(task.engine==='finance'){
  const receipts=(await sql(env,p.kind==='internal'?'SELECT currency,sum(amount_minor) AS received_minor,count(*) AS receipts FROM payments GROUP BY currency':'SELECT currency,sum(amount_minor) AS received_minor,count(*) AS receipts FROM payments WHERE project_id=? GROUP BY currency',...(p.kind==='internal'?[]:[p.id])).all()).results;
  const budget=p.kind==='internal'?await sql(env,'SELECT reserved_micro_usd FROM budget WHERE month=?',stamp().slice(0,7)).first():null;
  return {summary:'Finance summary from recorded receipts and platform allocations.',sections:[{title:'Recorded receipts',body:receipts.length?receipts.map(r=>`${r.currency}: ${(r.received_minor/100).toFixed(2)} from ${r.receipts} receipt(s).`).join('\n'):'No receipts recorded.'},...(p.kind==='internal'?[{title:'AI allocation',body:`${((budget?.reserved_micro_usd??0)/1000000).toFixed(4)} USD reserved against a ${(Number(env.MONTHLY_CAP_MICRO_USD||0)/1000000).toFixed(2)} USD monthly ceiling. This is an execution allocation, not an invoice or profit statement.`}]:[])],findings:['Currency totals remain separate; no exchange rate was inferred.'],questions:['Reconcile receipts to the merchant or bank statement and include expenses before reporting profit.']};
 }
 const prior=(await sql(env,"SELECT role,engine,output FROM tasks WHERE project_id=? AND position<? AND state='complete' ORDER BY position",p.id,task.position).all()).results;
 if(task.engine==='quality'){const data=prior.find(t=>t.engine==='data-quality');if(!data)throw new Error('The delivery stage has no assessment.');const o=JSON.parse(data.output);return {summary:'The assessment has complete row counts, field statistics and recommendations.',sections:[{title:'Validation',body:`Validated ${o.fields.length} field records against the supplied ${o.row_count} rows. This does not verify the truth of source records.`}],findings:[`${o.duplicate_rows} duplicate rows require review against the business record key.`],actions:['Review findings against the requested decision.']};}
 if(task.engine==='controls')return {summary:'Release controls and data-use checks recorded.',sections:[{title:'Assessment boundary',body:'Findings describe only the data supplied. No external dataset was accessed and no factual or legal compliance claim is made.'}],questions:['Confirm the supplied data may be used for this engagement.'],actions:['Release the authorised result through the customer portal and authenticated API.']};
 throw new Error('Unknown deterministic engine.');
}
async function packageReady(env){
 const p=await sql(env,"SELECT * FROM projects p WHERE state='active' AND EXISTS(SELECT 1 FROM tasks t WHERE t.project_id=p.id) AND NOT EXISTS(SELECT 1 FROM tasks t WHERE t.project_id=p.id AND t.state!='complete') ORDER BY created_at LIMIT 1").first();if(!p)return null;
 const claim=await sql(env,"UPDATE projects SET state='packaging',updated_at=? WHERE id=? AND state='active'",stamp(),p.id).run();if(!claim.meta.changes)return null;
 await buildDeliverables(env,p);await sql(env,"UPDATE projects SET state='review',updated_at=? WHERE id=? AND state='packaging'",stamp(),p.id).run();await event(env,p.id,'deliverables_ready','chief-of-staff');
 const allowed=await policy(env,'auto_release_services',[]);if(allowed.includes(p.service)){await releaseProject(env,{...p,state:'review'},'policy:auto-release');return {id:p.id,state:'delivered'};}return {id:p.id,state:'review'};
}
export async function releaseProject(env,p,actor){
 const q=await sql(env,"SELECT count(*) AS n FROM tasks WHERE project_id=? AND state!='complete'",p.id).first();const files=await sql(env,'SELECT count(*) AS n FROM deliverables WHERE project_id=?',p.id).first();
 if(q.n||files.n<3)fail(409,'Complete workflow and deliverables are required before release.');
 const file=await sql(env,"SELECT id,content FROM deliverables WHERE project_id=? AND name='report.json'",p.id).first();
 const value=JSON.parse(file.content);value.review={required:true,state:'released',released_at:stamp(),released_by:actor};const content=JSON.stringify(value,null,2);
 const changes=await env.DB.batch([sql(env,"UPDATE deliverables SET content=?,sha256=? WHERE id=? AND EXISTS(SELECT 1 FROM projects WHERE id=? AND state='review')",content,await sha(content),file.id,p.id),sql(env,"UPDATE projects SET state='delivered',updated_at=? WHERE id=? AND state='review'",stamp(),p.id)]);if(!changes[1].meta.changes)fail(409,'Project must be in review.');
 await event(env,p.id,'released',actor);await enqueueNotification(env,{...p,state:'delivered'},'delivered');
}
export async function runBusiness(env,request=fetch,projectId=null){
 const expired=new Date(Date.now()-180000).toISOString();
 await sql(env,"UPDATE tasks SET state='failed',error='Execution interrupted; inspect before retrying.',updated_at=? WHERE state='running' AND started_at<?",stamp(),expired).run();
 await sql(env,"UPDATE projects SET state='blocked',updated_at=? WHERE state='active' AND EXISTS(SELECT 1 FROM tasks WHERE tasks.project_id=projects.id AND state='failed')",stamp()).run();
 await sql(env,"UPDATE projects SET state='active',updated_at=? WHERE state='packaging' AND updated_at<?",stamp(),expired).run();
 const packaged=await packageReady(env);if(packaged)return {processed:true,...packaged};
 const task=await sql(env,"SELECT t.* FROM tasks t JOIN projects p ON p.id=t.project_id WHERE t.state='pending' AND (p.state='active' OR (p.state='enquiry' AND t.engine='qualification')) AND (t.engine NOT IN('model','web-search') OR ?='true') AND (? IS NULL OR p.id=?) AND NOT EXISTS(SELECT 1 FROM tasks earlier WHERE earlier.project_id=t.project_id AND earlier.position<t.position AND earlier.state!='complete') ORDER BY p.created_at,t.position LIMIT 1",env.AI_ENABLED??'false',projectId,projectId).first();
 if(!task)return {processed:false};
 const claim=await sql(env,"UPDATE tasks SET state='running',started_at=?,updated_at=? WHERE id=? AND state='pending'",stamp(),stamp(),task.id).run();if(!claim.meta.changes)return {processed:false};
 const p=await sql(env,'SELECT * FROM projects WHERE id=?',task.project_id).first();
 try{
  const output=task.engine==='model'?await generate(env,task,await contextFor(env,p,task),request):task.engine==='web-search'?await researchSearch(env,task,p,request):await deterministic(env,p,task);
  await env.DB.batch([sql(env,"UPDATE tasks SET state='complete',output=?,updated_at=? WHERE id=? AND state='running'",JSON.stringify(output),stamp(),task.id),sql(env,'INSERT INTO activity(project_id,event,actor,details,created_at) VALUES(?,?,?,?,?)',p.id,'task_completed',task.role,JSON.stringify({task_id:task.id,engine:task.engine}),stamp())]);
  const packageResult=await packageReady(env);return {processed:true,task_id:task.id,project_id:p.id,...(packageResult??{state:p.state})};
 }catch(error){
  const safeMessages=['Monthly AI spending limit reached.','AI connection is required.','AI budget and rates are not configured.','Task context exceeds the model input limit. Split the engagement.','AI provider request failed. Inspect the provider before retrying.','AI response reached its output limit. Split the task before retrying.','AI returned invalid JSON.','AI returned an incomplete result.','AI returned an invalid result.','AI referenced a source that was not supplied.','AI returned invalid implementation files.','Live research requires the configured GPT-4.1 mini OpenAI adapter.','Live research returned no source evidence.'];
  const message=safeMessages.includes(error.message)?error.message:'Task failed. Inspect configuration and input before retrying.';
  await env.DB.batch([sql(env,"UPDATE tasks SET state='failed',error=?,updated_at=? WHERE id=?",message,stamp(),task.id),sql(env,"UPDATE projects SET state='blocked',updated_at=? WHERE id=? AND state='active'",stamp(),p.id)]);await event(env,p.id,'task_failed',task.role,{task_id:task.id,error:message});return {processed:true,project_id:p.id,state:'blocked'};
 }
}
export async function runSchedules(env){
 const due=(await sql(env,'SELECT * FROM schedules WHERE enabled=1 AND next_run_at<=? ORDER BY next_run_at LIMIT 3',stamp()).all()).results;
 const results=[];for(const s of due){const key='schedule-'+s.id+'-'+s.next_run_at.replace(/[^0-9]/g,'');
  const outstanding=await sql(env,"SELECT id FROM projects WHERE kind='internal' AND title=? AND state NOT IN('delivered','cancelled','archived') LIMIT 1",s.name).first();
  if(outstanding){await sql(env,'UPDATE schedules SET next_run_at=? WHERE id=? AND next_run_at=?',new Date(Date.now()+s.interval_hours*3600000).toISOString(),s.id,s.next_run_at).run();continue;}
  const r=await createProject(env,{id:'admin',admin:true},{service:s.service,title:s.name,brief:s.brief,input:JSON.parse(s.input)},key,true);
  await sql(env,'UPDATE schedules SET next_run_at=? WHERE id=? AND next_run_at=?',new Date(Date.now()+s.interval_hours*3600000).toISOString(),s.id,s.next_run_at).run();results.push(r.project.id);
 }return results;
}
export async function runMonitors(env,request=fetch){
 const due=(await sql(env,'SELECT * FROM monitors WHERE next_run_at<=? ORDER BY next_run_at LIMIT 2',stamp()).all()).results;
 for(const m of due){const next=new Date(Date.now()+m.interval_minutes*60000).toISOString();const claim=await sql(env,'UPDATE monitors SET next_run_at=? WHERE id=? AND next_run_at=?',next,m.id,m.next_run_at).run();if(!claim.meta.changes)continue;
  let status=0;try{const {safeUrl}=await import('./common.mjs');const url=safeUrl(m.url,await policy(env,'monitor_hosts',['datasds.org','sds-agent-operations.sds-9991a64282bd.workers.dev']));const r=await request(url,{method:'GET',redirect:'error',signal:AbortSignal.timeout(10000)});status=r.status;await r.body?.cancel();}catch{}
  const state=status>=200&&status<400?'healthy':'down';let incident=m.incident_project;
  if(state==='down'&&m.state!=='down'){const key='incident-'+m.id+'-'+m.next_run_at.replace(/[^0-9]/g,'');const p=await createProject(env,{id:'admin',admin:true},{service:'maintenance-review',title:`Incident: ${m.name}`,brief:`Monitor ${m.url} reported ${status||'a network failure'} at ${stamp()}. Diagnose the supplied status, request missing evidence and prepare a recovery plan.`,input:{context:'No private logs have been supplied.'}},key,true);incident=p.project.id;await event(env,incident,'monitor_incident','maintenance',{monitor_id:m.id,http_status:status});}
  await sql(env,'UPDATE monitors SET state=?,http_status=?,checked_at=?,incident_project=? WHERE id=?',state,status,stamp(),incident,m.id).run();
  if(state==='healthy'&&m.state==='down')await event(env,incident,'monitor_recovered','maintenance',{monitor_id:m.id});
 }return due.length;
}
export async function tick(env,request=fetch){
 await runSchedules(env);await runMonitors(env,request);const steps=[];for(let i=0;i<3;i++){const r=await runBusiness(env,request);steps.push(r);if(!r.processed)break;}
 await runWebhook(env,request);return {steps};
}
