import { randomUUID, createHash } from 'node:crypto';
export async function verifyBusiness(url,admin,request=fetch){
 const call=async(path,method='GET',data,token=admin,key=randomUUID())=>{
  const r=await request(url+path,{method,redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Idempotency-Key':key},body:data===undefined?undefined:JSON.stringify(data)});
  if(!r.ok)throw new Error(`Business live check failed: ${method} ${path.split('/').slice(0,3).join('/')} HTTP ${r.status}.`);return {response:r,value:await r.json()};
 };
 const clients=[];let project;
 try{
  const ready=(await call('/ready')).value;if(ready.status!=='ready')throw new Error('Business readiness check failed.');
  const cat=(await call('/v2/catalogue')).value;if(cat.schema_version!=='2.0'||cat.roles.length<10)throw new Error('Business catalogue check failed.');
  for(let n=0;n<2;n++){const c=(await call('/v1/clients','POST',{name:'Deployment verification '+n})).value;clients.push(c);}
  project=(await call('/v2/projects','POST',{title:'Deployment verification / synthetic assessment',service:'data-quality',brief:'Verify the customer journey using synthetic records. No paid engagement or external communication.',input:{rows:[{customer:'Synthetic A',amount:100},{customer:'Synthetic A',amount:100},{customer:'Synthetic B',amount:null}]}},clients[0].token)).value;
  const q=(await call(`/v2/projects/${project.id}/quote`,'POST',{currency:'USD',amount_minor:0,scope:'Synthetic deployment verification only.',terms:'No commercial charge. No real customer data.'})).value;
  await call(`/v2/projects/${project.id}/accept`,'POST',{quote_id:q.id,accepted:true},clients[0].token);
  // Process this synthetic project directly without triggering paid work or schedules.
  for(let n=0;n<6;n++){await call(`/v2/projects/${project.id}/process`,'POST');const p=(await call(`/v2/projects/${project.id}`)).value;if(p.state==='review')break;}
  const before=(await call(`/v2/projects/${project.id}`,'GET',undefined,clients[0].token)).value;if(before.result||before.deliverables.length)throw new Error('Unreleased output was visible.');
  await call(`/v2/projects/${project.id}/release`,'POST');const result=(await call(`/v2/projects/${project.id}`,'GET',undefined,clients[0].token)).value;
  if(result.state!=='delivered'||result.result.results.find(r=>r.engine==='data-quality')?.result.duplicate_rows!==1||result.deliverables.length!==4)throw new Error('Customer delivery check failed.');
  const file=result.deliverables.find(f=>f.name==='report.md');const r=await request(url+file.url,{redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${clients[0].token}`}});if(!r.ok)throw new Error('Authenticated download check failed.');const content=await r.text();if(createHash('sha256').update(content).digest('hex')!==file.sha256)throw new Error('Deliverable hash check failed.');
  const denied=await request(url+`/v2/projects/${project.id}`,{redirect:'error',headers:{Authorization:`Bearer ${clients[1].token}`}});if(denied.status!==404)throw new Error('Customer isolation check failed.');
  for(const path of ['/portal/','/business/','/api/','/openapi.json']){const r=await request(url+path,{redirect:'error',signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error('Business screen check failed.');}
  return {verified:true,checks:['readiness','customer_request','quote_acceptance','free_workflow','release_gate','customer_delivery','authenticated_download','content_hash','customer_isolation','portal','operations','api_docs']};
 }finally{
  if(project)await call(`/v2/projects/${project.id}/erase`,'POST',{confirm_project_id:project.id}).catch(()=>{});
  for(const c of clients)await call(`/v1/clients/${c.id}/revoke`,'POST').catch(()=>{});
 }
}
