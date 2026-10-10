import { sql, stamp, uid, fail, hmac, equal, policy, safeUrl } from './common.mjs';
export async function connectionStatus(env){const saved=await sql(env,"SELECT name FROM integrations WHERE name='google_refresh_token'").first();return {
 ai:env.AI_ENABLED==='true'&&env.AI_API_KEY?'connected':'credentials_required',
 google:env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET&&(env.GOOGLE_REFRESH_TOKEN||saved)?(saved?'authorised':'configured_unverified'):'credentials_required',
 github:env.SDS_GITHUB_TOKEN?'configured_unverified':'credentials_required',
 payments:env.STRIPE_SECRET_KEY&&env.STRIPE_WEBHOOK_SECRET?'stripe_configured_unverified':'manual_receipts',
 webhooks:'available_for_approved_hosts', sources:'available_for_approved_hosts'
};}
export async function cryptSecret(env,value,decode=false){
 const raw=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('sds-webhook-v2:'+ (env.WEBHOOK_ENCRYPTION_KEY||env.ADMIN_TOKEN)));
 const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
 if(decode){const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12)));}
 const iv=crypto.getRandomValues(new Uint8Array(12)),encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(value)));
 return btoa(String.fromCharCode(...iv,...encrypted));
}
export async function enqueueNotification(env,project,eventName){
 const account=await sql(env,'SELECT email FROM clients WHERE id=?',project.client_id).first();
 if(account?.email){await sql(env,'INSERT INTO outbox(id,project_id,channel,recipient,subject,content,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',uid(),project.id,'email',account.email,`SDS: ${project.title} — ${eventName}`,`Your SDS project ${project.id} is ${eventName}. Open your SDS customer workspace to view its status and authorised deliverables.`,stamp(),stamp()).run();}
 const sub=await sql(env,'SELECT * FROM webhook_subscriptions WHERE client_id=? AND enabled=1',project.client_id).first();
 if(sub)await sql(env,"INSERT OR IGNORE INTO webhook_deliveries(id,client_id,project_id,event,payload,next_attempt_at,created_at) VALUES(?,?,?,?,?,?,?)",uid(),project.client_id,project.id,eventName,JSON.stringify({schema_version:'2.0',event:eventName,project_id:project.id,status:project.state,url:`/v2/projects/${project.id}`,occurred_at:stamp()}),stamp(),stamp()).run();
}
export async function runWebhook(env,request=fetch){
 await sql(env,"UPDATE webhook_deliveries SET state='pending' WHERE state='sending' AND next_attempt_at<?",stamp()).run();
 const item=await sql(env,"SELECT * FROM webhook_deliveries WHERE state='pending' AND next_attempt_at<=? ORDER BY created_at LIMIT 1",stamp()).first();if(!item)return {processed:false};
 const claim=await sql(env,"UPDATE webhook_deliveries SET state='sending',attempts=attempts+1,next_attempt_at=? WHERE id=? AND state='pending'",new Date(Date.now()+180000).toISOString(),item.id).run();if(!claim.meta.changes)return {processed:false};
 let status=0;
 try{
  const sub=await sql(env,'SELECT w.* FROM webhook_subscriptions w JOIN clients c ON c.id=w.client_id WHERE w.client_id=? AND w.enabled=1 AND c.active=1',item.client_id).first();if(!sub)throw new Error();
  const url=safeUrl(sub.url,await policy(env,'outbound_hosts',[]));const secret=await cryptSecret(env,sub.secret,true);const time=String(Math.floor(Date.now()/1000));
  const payload=JSON.stringify({...JSON.parse(item.payload),event_id:item.id});
  const signature=await hmac(secret,time+'.'+payload);
  const r=await request(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json','SDS-Event-ID':item.id,'SDS-Signature':`t=${time},v1=${signature}`},body:payload});status=r.status;if(!r.ok)throw new Error();
  await sql(env,"UPDATE webhook_deliveries SET state='sent',last_status=? WHERE id=?",status,item.id).run();return {processed:true,state:'sent'};
 }catch{
  const attempts=item.attempts+1;await sql(env,'UPDATE webhook_deliveries SET state=?,last_status=?,next_attempt_at=? WHERE id=?',attempts>=5?'failed':'pending',status,new Date(Date.now()+Math.min(24*60*60*1000,60000*2**attempts)).toISOString(),item.id).run();return {processed:true,state:attempts>=5?'failed':'pending'};
 }
}
export async function fetchSource(env,url,request=fetch){
 const checked=safeUrl(url,await policy(env,'source_hosts',['developers.cloudflare.com','developers.openai.com','learn.chatgpt.com','developers.google.com','docs.github.com','datasds.org']));
 const r=await request(checked,{redirect:'error',signal:AbortSignal.timeout(15000),headers:{Accept:'text/html, text/plain, application/json','User-Agent':'SDS-Research/2.0'}});if(!r.ok)fail(502,'Source request failed.');
 const type=r.headers.get('content-type')||'';if(!/text\/|application\/json/.test(type))fail(415,'Only text, HTML or JSON sources are supported.');
 const reader=r.body.getReader();let n=0;const chunks=[];while(true){const{done,value}=await reader.read();if(done)break;n+=value.length;if(n>100000){await reader.cancel();fail(413,'Source exceeds 100 KB.');}chunks.push(value);}
 const bytes=new Uint8Array(n);let i=0;for(const c of chunks){bytes.set(c,i);i+=c.length;}
 const raw=new TextDecoder().decode(bytes);return type.includes('html')?raw.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim():raw;
}
async function googleToken(env,request){
 const saved=await sql(env,"SELECT value FROM integrations WHERE name='google_refresh_token'").first();const refresh=env.GOOGLE_REFRESH_TOKEN||(saved?await cryptSecret(env,saved.value,true):null);
 if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!refresh)fail(503,'Google Workspace credentials are not connected.');
 const response=await request('https://oauth2.googleapis.com/token',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:refresh,grant_type:'refresh_token'})});
 if(!response.ok)fail(502,'Google authorisation failed.');const data=await response.json();if(!data.access_token)fail(502,'Google returned no access token.');return data.access_token;
}
export async function gmail(env,item,send=false,request=fetch){
 const access=await googleToken(env,request);const b64=v=>btoa(String.fromCharCode(...new TextEncoder().encode(v))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 const headers={Authorization:`Bearer ${access}`,'Content-Type':'application/json'};
 if(send){if(!item.provider_id)fail(409,'Create and inspect the Google draft first.');const r=await request('https://gmail.googleapis.com/gmail/v1/users/me/drafts/send',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers,body:JSON.stringify({id:item.provider_id})});if(!r.ok)fail(502,'Google did not confirm sending. Inspect the mailbox before retrying.');return (await r.json()).id;}
 if(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(item.recipient)||/[\r\n]/.test(item.subject))fail(400,'Invalid email recipient or subject.');
 const raw=b64(`To: ${item.recipient}\r\nSubject: =?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(item.subject)))}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${btoa(String.fromCharCode(...new TextEncoder().encode(item.content)))}`);
 const r=await request('https://gmail.googleapis.com/gmail/v1/users/me/drafts',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers,body:JSON.stringify({message:{raw}})});if(!r.ok)fail(502,'Google draft creation failed. Inspect the mailbox before retrying.');return (await r.json()).id;
}
export async function stripeCheckout(env,project,quote,origin,request=fetch){
 if(!env.STRIPE_SECRET_KEY)fail(503,'An online payment account is not connected. Contact SDS for payment instructions.');
 const existing=await sql(env,'SELECT * FROM checkout_sessions WHERE quote_id=? AND expires_at>?',quote.id,stamp()).first();if(existing)return existing;
 const params=new URLSearchParams({mode:'payment',success_url:origin+'/portal/?payment=returned',cancel_url:origin+'/portal/?payment=cancelled',client_reference_id:project.id,
 'metadata[project_id]':project.id,'metadata[quote_id]':quote.id,'line_items[0][quantity]':'1','line_items[0][price_data][currency]':quote.currency.toLowerCase(),'line_items[0][price_data][unit_amount]':String(quote.amount_minor),'line_items[0][price_data][product_data][name]':project.title});
 const r=await request('https://api.stripe.com/v1/checkout/sessions',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'sds-quote-'+quote.id},body:params});
 if(!r.ok)fail(502,'Payment session could not be created.');const data=await r.json();if(!data.id||!data.url||!Number.isFinite(data.expires_at)||new URL(data.url).hostname!=='checkout.stripe.com')fail(502,'Payment provider returned an invalid session.');
 const row={quote_id:quote.id,provider:'stripe',provider_id:data.id,url:data.url,expires_at:new Date(data.expires_at*1000).toISOString()};
 await sql(env,'INSERT OR REPLACE INTO checkout_sessions(quote_id,provider,provider_id,url,expires_at) VALUES(?,?,?,?,?)',row.quote_id,row.provider,row.provider_id,row.url,row.expires_at).run();return row;
}
export async function verifyStripe(env,raw,header){
 if(!env.STRIPE_WEBHOOK_SECRET)fail(503,'Payment webhook is not configured.');
 const parts=(header||'').split(',').map(x=>x.split('='));const time=parts.find(x=>x[0]==='t')?.[1];
 if(!/^\d+$/.test(time||'')||Math.abs(Date.now()/1000-Number(time))>300)fail(401,'Expired payment signature.');
 const expected=await hmac(env.STRIPE_WEBHOOK_SECRET,time+'.'+raw);if(!parts.some(x=>x[0]==='v1'&&equal(x[1],expected)))fail(401,'Invalid payment signature.');
 try{return JSON.parse(raw);}catch{fail(400,'Invalid payment event.');}
}
export function validateFiles(files,{repository=true}={}){
 if(!Array.isArray(files)||!files.length||files.length>20)fail(400,'Provide 1–20 implementation files.');
 const seen=new Set();for(const f of files){if(typeof f.path!=='string'||!f.path||f.path.length>200||f.path.startsWith('/')||f.path.includes('..')||f.path.includes('\\')||/[\x00-\x1f]/.test(f.path)||f.path.split('/').some(s=>/^\.env(?:\.|$)/.test(s))||(repository&&(f.path.split('/').some(s=>s.startsWith('.'))||! /^(src\/|public\/|services\/|docs\/|test\/|README\.md$)/.test(f.path)))||typeof f.content!=='string'||f.content.length>40000||seen.has(f.path))fail(400,'Implementation files contain a prohibited or duplicate path.');seen.add(f.path);}
 return files;
}
export async function openPullRequest(env,change,request=fetch){
 if(!env.SDS_GITHUB_TOKEN)fail(503,'A repository write credential is not connected.');const files=validateFiles(JSON.parse(change.files));
 const repo='Ric-Royal/sds';const api=async(path,method='GET',data)=>{const r=await request('https://api.github.com/repos/'+repo+path,{method,redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${env.SDS_GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','User-Agent':'SDS-Engineering'},body:data===undefined?undefined:JSON.stringify(data)});if(!r.ok)fail(502,'GitHub request failed. Inspect repository state before retrying.');return r.json();};
 const branch='sds-agent/'+change.id;const defaultBranch=env.SDS_GITHUB_BASE_BRANCH||'master';const head=await api('/git/ref/heads/'+encodeURIComponent(defaultBranch));if(head.object.sha!==change.base_sha)fail(409,'Repository changed since proposal. Refresh and review the change against the current base.');
 const commit=await api('/git/commits/'+change.base_sha);const tree=await api('/git/trees','POST',{base_tree:commit.tree.sha,tree:files.map(f=>({path:f.path,mode:'100644',type:'blob',content:f.content}))});
 const next=await api('/git/commits','POST',{message:change.title,tree:tree.sha,parents:[change.base_sha]});await api('/git/refs','POST',{ref:'refs/heads/'+branch,sha:next.sha});
 const pr=await api('/pulls','POST',{title:change.title,head:branch,base:defaultBranch,draft:true,body:`SDS engineering proposal for project ${change.project_id}.\n\nFiles were reviewed before this pull request was created. Code execution and validation must be recorded by CI and the reviewer before merging.\n\nNo automatic merge or production deployment was performed.`});return pr.html_url;
}
