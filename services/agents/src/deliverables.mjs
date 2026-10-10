import { sql, uid, stamp, sha, escapeHtml } from './common.mjs';
import { zip, base64 } from './archive.mjs';
import { validateFiles } from './integrations.mjs';
const stringify=v=>JSON.stringify(v,null,2);
export function renderMarkdown(project,tasks,sources){
 const lines=[`# ${project.title}`,'',`SDS · ${project.service} · Project ${project.id}`,'', '## Project brief','',project.brief,''];
 for(const t of tasks){const o=typeof t.output==='string'?JSON.parse(t.output):t.output;lines.push(`## ${t.role}`, '', o.summary||'', '');
  if(o.row_count!==undefined){lines.push(`Rows assessed: ${o.row_count}. Duplicate rows: ${o.duplicate_rows}.`,'','| Field | Missing | Observed types |','| --- | ---: | --- |');for(const f of o.fields)lines.push(`| ${String(f.name).replace(/\|/g,'\\|')} | ${f.missing} | ${f.observed_types.join(', ')} |`);lines.push('');}
  for(const s of o.sections||[])lines.push(`### ${s.title}`,'',s.body,'');
  for(const [k,title]of [['findings','Findings'],['recommendations','Recommendations'],['actions','Actions'],['questions','Open questions']])if(o[k]?.length)lines.push(`### ${title}`,'',...o[k].map(x=>`- ${x}`),'');
 }
 if(sources.length)lines.push('## Evidence','',...sources.map(s=>`- ${s.title} (${s.id})${s.url?' — '+s.url:''}`),'');
 lines.push('## Delivery record','','This report combines the project workflow results. Model-authored sections and deterministic checks are identified in the JSON result. Implementation files are proposals until their execution and validation are recorded.');
 return lines.join('\n');
}
export async function buildDeliverables(env,project){
 const tasks=(await sql(env,"SELECT * FROM tasks WHERE project_id=? AND state='complete' ORDER BY position",project.id).all()).results;
 const input=JSON.parse(project.input);const sources=[];for(const id of input.sources||[]){const s=await sql(env,'SELECT id,title,url,fetched_at FROM knowledge WHERE id=? AND approved=1',id).first();if(s)sources.push(s);}
 for(const t of tasks)for(const s of JSON.parse(t.output).evidence||[])if(!sources.some(x=>x.id===s.id))sources.push(s);
 const report={schema_version:'2.0',project_id:project.id,title:project.title,service:project.service,generated_at:stamp(),
  results:tasks.map(t=>({role:t.role,engine:t.engine,result:JSON.parse(t.output)})),sources,
  review:{required:true,state:'pending'},delivery_formats:['application/json','text/markdown','text/html',...(project.service==='data-quality'?['text/csv']:[])]};
 const md=renderMarkdown(project,tasks,sources);
 const links=sources.filter(s=>s.url?.startsWith('https://')).map(s=>`<li><a href="${escapeHtml(s.url)}" rel="noopener noreferrer">${escapeHtml(s.title)}</a></li>`).join('');
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(project.title)} · SDS</title><style>body{font:16px/1.6 system-ui;color:#172b27;max-width:900px;margin:50px auto;padding:24px}header{border-bottom:3px solid #185442;padding-bottom:24px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}small{color:#566}@media print{body{margin:0;max-width:none}header{break-after:avoid}}</style></head><body><header><strong>SDS / Data. Decisions. Systems.</strong><p>${escapeHtml(project.title)}</p><small>Project ${escapeHtml(project.id)}</small></header><pre>${escapeHtml(md)}</pre>${links?`<section><h2>Evidence links</h2><ul>${links}</ul></section>`:""}</body></html>`;
 const files=[{name:'report.json',mime:'application/json',content:stringify(report)},{name:'report.md',mime:'text/markdown',content:md},{name:'report.html',mime:'text/html',content:html}];
 const quality=tasks.find(t=>t.engine==='data-quality');if(quality){const data=JSON.parse(quality.output);const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';const safe=v=>/^[=+@\-\t\r]/.test(String(v))?"'"+v:v;files.push({name:'field-quality.csv',mime:'text/csv',content:['field,missing,observed_types',...data.fields.map(f=>[f.name,f.missing,f.observed_types.join(';')].map(x=>quote(safe(x))).join(','))].join('\r\n')});}
 const implementation=new Map();for(const t of tasks){const output=JSON.parse(t.output);if(output.files?.length)for(const f of validateFiles(output.files,{repository:false}))implementation.set(f.path,f);}
 if(implementation.size){const proposed=[...implementation.values()];const archive=zip(proposed);files.push({name:'implementation.zip',mime:'application/zip',content:base64(archive),encoding:'base64',digest:await sha(archive)});files.push({name:'implementation-manifest.json',mime:'application/json',content:JSON.stringify({status:'proposed',files:await Promise.all(proposed.map(async f=>({path:f.path,sha256:await sha(f.content)}))),execution:'Code has not been executed by this report generator.'},null,2)});}
 report.delivery_formats=[...new Set(files.map(f=>f.mime))];files[0].content=stringify(report);
 const statements=[];for(const f of files)statements.push(sql(env,'INSERT OR IGNORE INTO deliverables(id,project_id,name,mime,content,sha256,created_at,encoding) VALUES(?,?,?,?,?,?,?,?)',uid(),project.id,f.name,f.mime,f.content,f.digest||await sha(f.content),stamp(),f.encoding||'utf8'));
 await env.DB.batch(statements);return files.length;
}
