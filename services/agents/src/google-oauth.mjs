import { sql, uid, sha, stamp, fail, event } from './common.mjs';
import { cryptSecret } from './integrations.mjs';
export async function googleAuthorise(env,origin){
 if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET)fail(503,'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first. See the connection instructions.');
 const state=uid()+uid(),verifier=uid()+uid();const challenge=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 await sql(env,'INSERT INTO oauth_states(key_hash,verifier,expires_at) VALUES(?,?,?)',await sha(state),await cryptSecret(env,verifier),new Date(Date.now()+600000).toISOString()).run();
 const u=new URL('https://accounts.google.com/o/oauth2/v2/auth');u.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:origin+'/v2/google/callback',response_type:'code',scope:'https://www.googleapis.com/auth/gmail.compose',access_type:'offline',prompt:'consent',state,code_challenge:challenge,code_challenge_method:'S256'});
 return {url:u.href,scope:'Create and send drafts in the Google mailbox you authorise. SDS requires a recorded recipient approval before sending.'};
}
export async function googleCallback(request,env,requestFn=fetch){
 const u=new URL(request.url),state=u.searchParams.get('state'),code=u.searchParams.get('code');if(!state||state.length>200)fail(400,'Google authorisation state is missing.');const digest=await sha(state);const saved=await sql(env,'SELECT * FROM oauth_states WHERE key_hash=? AND expires_at>?',digest,stamp()).first();if(!saved)fail(400,'Google authorisation expired. Start again from Business Operations.');
 const claim=await sql(env,'DELETE FROM oauth_states WHERE key_hash=?',digest).run();if(!claim.meta.changes)fail(409,'Google authorisation was already processed.');if(u.searchParams.has('error')||!code)fail(400,'Google authorisation was not completed.');
 const r=await requestFn('https://oauth2.googleapis.com/token',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:u.origin+'/v2/google/callback',grant_type:'authorization_code',code_verifier:await cryptSecret(env,saved.verifier,true)})});
 if(!r.ok)fail(502,'Google token exchange failed. Start authorisation again.');const data=await r.json();if(!data.refresh_token)fail(502,'Google did not return offline access. Start authorisation again.');
 await sql(env,"INSERT INTO integrations(name,value,updated_at) VALUES('google_refresh_token',?,?) ON CONFLICT(name) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",await cryptSecret(env,data.refresh_token),stamp()).run();await event(env,null,'google_mailbox_authorised','admin');
 return Response.redirect(u.origin+'/business/?google=connected',303);
}
