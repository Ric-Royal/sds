import { body, json, idem, fail, uid, limit, stamp } from './common.mjs';
import { services } from './services.mjs';
import { routeV2 } from './api-v2.mjs';
const definitions=[
 {name:'sds_list_services',description:'List SDS services and response formats.',inputSchema:{type:'object',properties:{}}},
 {name:'sds_create_project',description:'Request SDS work. Returns project ID and status; does not accept a quote or authorise payment.',inputSchema:{type:'object',properties:{title:{type:'string'},service:{type:'string'},brief:{type:'string'},input:{type:'object'},idempotency_key:{type:'string'}},required:['title','service','brief','idempotency_key']}},
 {name:'sds_get_project',description:'Read status, quote and authorised deliverables for one of your projects.',inputSchema:{type:'object',properties:{project_id:{type:'string'}},required:['project_id']}},
 {name:'sds_list_projects',description:'List your SDS projects.',inputSchema:{type:'object',properties:{}}},
 {name:'sds_accept_quote',description:'Accept the exact issued quote on behalf of the customer. Requires explicit accepted:true; financial commitments must be authorised by your owner.',inputSchema:{type:'object',properties:{project_id:{type:'string'},quote_id:{type:'string'},accepted:{type:'boolean'}},required:['project_id','quote_id','accepted']}},
 {name:'sds_project_message',description:'Add a message to your SDS project.',inputSchema:{type:'object',properties:{project_id:{type:'string'},text:{type:'string'}},required:['project_id','text']}}
];
export async function mcp(request,env,actor){
 const origin=request.headers.get('Origin');
 if(origin&&!new Set([new URL(request.url).origin,'https://datasds.org','https://www.datasds.org']).has(origin))return json({error:'Origin is not permitted.'},403);
 if(request.method!=='POST')return json({error:'Use authenticated POST with JSON-RPC 2.0.'},405,{Allow:'POST'});
 const b=await body(request);if(b.jsonrpc!=='2.0'||typeof b.method!=='string')return json({jsonrpc:'2.0',id:b.id??null,error:{code:-32600,message:'Invalid JSON-RPC request.'}},400);
 if(b.id===undefined){if(b.method==='notifications/initialized')return new Response(null,{status:202});return json({error:'Unsupported notification.'},400);}
 const result=value=>json({jsonrpc:'2.0',id:b.id,result:value});
 if(b.method==='initialize')return result({protocolVersion:'2025-06-18',capabilities:{tools:{listChanged:false}},serverInfo:{name:'sds-business',version:'2.0'},instructions:'Use your owner-authorised SDS client bearer token. Creating a project does not accept a quote or pay. Results are available after SDS release.'});
 if(b.method==='ping')return result({});if(b.method==='tools/list')return result({tools:definitions});
 if(b.method!=='tools/call')return json({jsonrpc:'2.0',id:b.id,error:{code:-32601,message:'Method not found.'}});
 const name=b.params?.name,args=b.params?.arguments??{};let path='/v2/projects',method='GET',payload;
 try{
  await limit(env,'mcp:'+actor.id+':'+stamp().slice(0,13),200);
  if(name==='sds_list_services')return result({content:[{type:'text',text:JSON.stringify({services})}],structuredContent:{services},isError:false});
  if(name==='sds_create_project'){method='POST';payload={title:args.title,service:args.service,brief:args.brief,input:args.input};}
  else if(name==='sds_list_projects'){}
  else if(['sds_get_project','sds_accept_quote','sds_project_message'].includes(name)){
   if(!/^[\w-]+$/.test(args.project_id||''))fail(400,'A project_id is required.');path+='/'+args.project_id;
   if(name==='sds_accept_quote'){path+='/accept';method='POST';payload={quote_id:args.quote_id,accepted:args.accepted};}
   if(name==='sds_project_message'){path+='/messages';method='POST';payload={text:args.text};}
  }else fail(400,'Unknown tool.');
  const headers={'Content-Type':'application/json','Idempotency-Key':args.idempotency_key??''};const next=new Request(new URL(path,request.url),{method,headers,body:payload?JSON.stringify(payload):undefined});
  const response=await routeV2(next,env,actor);const value=await response.json();return result({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value,isError:!response.ok});
 }catch(e){return result({content:[{type:'text',text:e.status?e.message:'SDS request failed.'}],isError:true});}
}
