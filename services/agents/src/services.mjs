import { assessRows } from './catalogue.mjs';
import { fail } from './common.mjs';
export const roles = [
 {id:'chief-of-staff',title:'Chief of Staff',work:'Routes requests, coordinates dependencies, schedules work and flags decisions.'},
 {id:'sales',title:'Sales',work:'Qualifies enquiries and drafts scope, proposals and follow-ups.'},
 {id:'research',title:'Research',work:'Retrieves approved sources and prepares evidence-led analysis.'},
 {id:'marketing',title:'Marketing',work:'Prepares campaigns, content calendars and channel copy.'},
 {id:'delivery',title:'Delivery',work:'Runs data assessments and prepares analytics deliverables.'},
 {id:'engineering',title:'Engineering',work:'Designs systems and proposes repository changes for review.'},
 {id:'maintenance',title:'Maintenance',work:'Monitors websites, records incidents and investigates failures.'},
 {id:'governance',title:'Governance',work:'Reviews data use, permissions, evidence and release decisions.'},
 {id:'finance',title:'Finance',work:'Tracks quotes, receipts, unpaid work and model spending.'},
 {id:'quality',title:'Quality',work:'Checks completeness and prepares the release checklist.'}
];
const step=(role,engine='model')=>({role,engine});
export const services = [
 {id:'data-quality',title:'Data quality assessment',description:'A reproducible assessment of missing values, duplicates and inconsistent field types.',formats:['json','html','md','csv'],flow:[step('chief-of-staff','intake'),step('delivery','data-quality'),step('quality','quality'),step('governance','controls')]},
 {id:'analytics-plan',title:'Analytics and BI engagement',description:'A scoped analytics plan with data requirements, KPIs, implementation steps and validation.',formats:['json','html','md'],flow:[step('sales'),step('research'),step('delivery'),step('engineering'),step('quality'),step('governance')]},
 {id:'research-report',title:'Research and advisory report',description:'Analysis of supplied material and approved live sources, with evidence and unresolved questions.',formats:['json','html','md'],flow:[step('research'),step('delivery'),step('quality'),step('governance')]},
 {id:'governance-review',title:'Policy and governance review',description:'Data, AI, access and operational controls mapped to the supplied system.',formats:['json','html','md'],flow:[step('research'),step('governance'),step('quality')]},
 {id:'system-build',title:'System design and engineering',description:'Architecture, implementation files, deployment instructions and test proposals. Repository changes use reviewed pull requests.',formats:['json','html','md'],flow:[step('sales'),step('research'),step('engineering'),step('quality'),step('governance')]},
 {id:'marketing-campaign',title:'Marketing campaign',description:'Audience research, campaign plan, content calendar and copy for approved channels.',formats:['json','html','md'],flow:[step('research'),step('marketing'),step('sales'),step('quality'),step('governance')]},
 {id:'maintenance-review',title:'Maintenance and incident response',description:'Health findings, incident analysis, corrective changes and recovery checklist.',formats:['json','html','md'],flow:[step('maintenance'),step('engineering'),step('quality'),step('governance')]},
 {id:'coordinated-engagement',title:'Coordinated agent engagement',description:'Combine the SDS roles needed for your project, with a shared brief, evidence and deliverable package.',formats:['json','html','md'],flow:[step('chief-of-staff'),step('research'),step('delivery'),step('engineering'),step('quality'),step('governance')]},
 {id:'finance-review',title:'Finance and operating review',description:'A receipt and spending summary, operating analysis and review questions.',formats:['json','html','md'],flow:[step('finance','finance'),step('chief-of-staff'),step('quality'),step('governance')]}
];
export function service(id){const s=services.find(x=>x.id===id);if(!s)fail(400,'Unknown service.');return s;}
export function parseCsv(input){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<input.length;i++){const c=input[i];if(quoted){if(c==='"'&&input[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"'&&cell==='')quoted=true;else if(c===','){row.push(cell);cell='';}else if(c==='\n'){row.push(cell.replace(/\r$/,''));if(row.some(x=>x!==''))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)fail(400,'CSV contains an unclosed quote.');row.push(cell.replace(/\r$/,''));if(row.some(x=>x!==''))rows.push(row);
 if(rows.length<2)fail(400,'CSV requires a header and at least one data row.');const names=rows.shift();
 if(names.some(x=>!x.trim())||new Set(names).size!==names.length||names.length>50)fail(400,'CSV headers must be distinct, non-empty and contain at most 50 fields.');
 return rows.map(r=>{if(r.length!==names.length)fail(400,'CSV rows must match the header width.');return Object.fromEntries(names.map((n,i)=>[n,r[i]]));});
}
export function inputFor(id,input={}){if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'input must be an object.');
 if(id==='data-quality'){const rows=typeof input.csv==='string'?parseCsv(input.csv):input.rows;try{assessRows(rows,5000);}catch(e){fail(400,e.message);}return {rows};}
 const extra=typeof input.context==='string'?input.context:'';if(extra.length>60000)fail(400,'Context exceeds 60,000 characters.');
 const sources=input.sources??[];if(!Array.isArray(sources)||sources.length>20||sources.some(x=>typeof x!=='string'||x.length>100))fail(400,'sources must contain up to 20 approved knowledge IDs.');
 const selected=input.roles??[];if(!Array.isArray(selected)||selected.length>10||new Set(selected).size!==selected.length||selected.some(x=>!roles.some(r=>r.id===x)))fail(400,'roles must contain up to 10 distinct SDS role IDs.');
 return {context:extra,sources,...(selected.length?{roles:selected}:{})};
}
