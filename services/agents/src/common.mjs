export const stamp = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const fail = (status, message) => { throw new HttpError(status, message); };
export const json = (data, status = 200, extra = {}) => Response.json(data, {status, headers: {
 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff',
 'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'", ...extra
}});
export async function sha(text) {
 const buffer = await crypto.subtle.digest('SHA-256', typeof text==='string'?new TextEncoder().encode(text):text);
 return [...new Uint8Array(buffer)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function hmac(secret, text) {
 const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(text)))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export function equal(a,b) { if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false; let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0; }
export async function readText(request, limit=512000) {
 const reader=request.body?.getReader(); if(!reader)fail(400,'A request body is required.');
 let n=0;const parts=[];while(true){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>limit){await reader.cancel();fail(413,'Request exceeds the 512 KB limit.');}parts.push(value);}
 const bytes=new Uint8Array(n);let i=0;for(const part of parts){bytes.set(part,i);i+=part.length;}return new TextDecoder().decode(bytes);
}
export async function body(request) {
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))fail(415,'Use application/json.');
 try {const b=JSON.parse(await readText(request));if(!b||typeof b!=='object'||Array.isArray(b))fail(400,'A JSON object is required.');return b;}
 catch(e){if(e instanceof HttpError)throw e;fail(400,'Invalid JSON.');}
}
export function text(value,name,max=12000,min=1){if(typeof value!=='string'||value.trim().length<min||value.length>max)fail(400,`${name} must contain ${min}–${max} characters.`);return value.trim();}
export function idem(request){const v=request.headers.get('Idempotency-Key');if(!/^[\w.-]{8,128}$/.test(v||''))fail(400,'Provide an Idempotency-Key of 8–128 letters, numbers, dots, dashes or underscores.');return v;}
export const sql=(env,q,...args)=>env.DB.prepare(q).bind(...args);
export async function event(env,project,eventName,actor,details={}){await sql(env,'INSERT INTO activity(project_id,event,actor,details,created_at) VALUES(?,?,?,?,?)',project,eventName,actor,JSON.stringify(details),stamp()).run();}
export function admin(actor){if(!actor.admin)fail(403,'Administrator access required.');}
export async function owned(env,id,actor){const p=await sql(env,'SELECT * FROM projects WHERE id=?',id).first();if(!p||(!actor.admin&&p.client_id!==actor.id))fail(404,'Project not found.');return p;}
export async function limit(env,key,max){const r=await sql(env,'INSERT INTO request_limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<?',key,max).run();if(!r.meta.changes)fail(429,'Request limit reached. Try again later.');}
export function safeUrl(value,allowedHosts=[]){let u;try{u=new URL(value);}catch{fail(400,'Provide an HTTPS URL.');}
 const host=u.hostname.toLowerCase();
 if(u.protocol!=='https:'||u.username||u.password||u.port||host==='localhost'||host.endsWith('.local')||host.endsWith('.internal')||host.endsWith('.localhost')||host.includes(':')||/^\d[\d.]*$/.test(host)||!host.includes('.')||host.endsWith('.nip.io')||host.endsWith('.sslip.io')||!allowedHosts.includes(host))fail(400,'The URL host must be on the administrator-approved host list.');
 return u.href;
}
export async function policy(env,key,fallback){const r=await sql(env,'SELECT value FROM policy WHERE key=?',key).first();return r?JSON.parse(r.value):fallback;}
export const escapeHtml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
