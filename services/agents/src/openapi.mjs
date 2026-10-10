export function openapi(origin){
 const response={description:'JSON result. Errors use {error:string}.'};const auth=[{bearerAuth:[]}];
 const post=(summary,properties,required=[],extra={})=>({summary,security:auth,requestBody:{required:true,content:{'application/json':{schema:{type:'object',properties,required}}}},responses:{'200':response,'202':response,'400':response,'401':response,'403':response,'409':response},...extra});
 const str={type:'string'},yes={type:'boolean'};
 return {openapi:'3.1.0',info:{title:'SDS Business API',version:'2.0',description:'Authenticated ordering, quotation, payment status and delivery for human customers and their agents. Bearer keys are issued once. Customer output is available after release. Amounts use minor currency units (KES 100.00 = 10000).'},servers:[{url:origin}],components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer'}}},paths:{
 '/health':{get:{summary:'Worker liveness and deployed revision',responses:{'200':response}}},
 '/ready':{get:{summary:'Business database, schema and administrator configuration readiness',responses:{'200':response,'503':response}}},
 '/v2/catalogue':{get:{summary:'Services, roles and available delivery formats',responses:{'200':response}}},
 '/v2/register':{post:post('Create a customer workspace',{name:str,email:str,organisation:str,consent:yes},['name','email','consent'],{security:[],parameters:[{in:'header',name:'Idempotency-Key',schema:{type:'string',format:'uuid'},description:'Use a random UUID v4 to safely replay registration for 24 hours.'}],responses:{'201':{description:'One-time access_key; save privately.'}}})},
 '/v2/enquiries':{post:post('Register and submit a website enquiry',{name:str,email:str,organisation:str,title:str,service:str,brief:str,consent:yes},['name','email','brief','consent'],{security:[],parameters:[{in:'header',name:'Idempotency-Key',required:true,schema:{type:'string',format:'uuid'}}],responses:{'202':response}})},
 '/v2/projects':{get:{summary:'List your projects',security:auth,responses:{'200':response}},post:post('Submit a project and receive a tracking resource',{title:str,service:str,brief:str,input:{type:'object'}},['title','service','brief'],{parameters:[{in:'header',name:'Idempotency-Key',required:true,schema:{type:'string',minLength:8,maxLength:128}}]})},
 '/v2/projects/{id}':{parameters:[{in:'path',name:'id',required:true,schema:str}],get:{summary:'Status, quote, payments, messages and released JSON result with file links',security:auth,responses:{'200':response,'404':response}}},
 '/v2/projects/{id}/accept':{parameters:[{in:'path',name:'id',required:true,schema:str}],post:post('Accept the exact current quote',{quote_id:str,accepted:yes},['quote_id','accepted'])},
 '/v2/projects/{id}/checkout':{parameters:[{in:'path',name:'id',required:true,schema:str}],post:{summary:'Create a provider checkout for an accepted quote',security:auth,responses:{'200':response,'503':{description:'Online payments not connected; use SDS instructions.'}}}},
 '/v2/projects/{id}/messages':{parameters:[{in:'path',name:'id',required:true,schema:str}],post:post('Message SDS about a project',{text:str},['text'])},
 '/v2/projects/{id}/files/{file_id}':{parameters:[{in:'path',name:'id',required:true,schema:str},{in:'path',name:'file_id',required:true,schema:str}],get:{summary:'Download an authorised deliverable; requires the same bearer token',security:auth,responses:{'200':{description:'Attachment with MIME type, filename and SHA256 header.'},'404':response}}},
 '/v2/webhook':{post:post('Subscribe your agent to signed completion events on an approved host',{url:str,secret:{type:'string',minLength:32}},['url','secret']),delete:{summary:'Remove webhook',security:auth,responses:{'200':response}}},
 '/v2/knowledge':{get:{summary:'List approved evidence sources',security:auth,responses:{'200':response}}},
 '/v2/projects/{id}/export':{parameters:[{in:'path',name:'id',required:true,schema:str}],get:{summary:'Export your project record and released result as JSON',security:auth,responses:{'200':response}}}
 }};
}
