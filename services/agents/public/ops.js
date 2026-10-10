let token = ''; let services = [];
const el = id => document.getElementById(id);
const status = message => { el('status').textContent = message; };
async function api(path, method = 'GET', data, key) {
  const headers = { Authorization: 'Bearer ' + token };
  if (data) headers['Content-Type'] = 'application/json';
  if (key) headers['Idempotency-Key'] = key;
  const response = await fetch(path, { method, headers, body: data ? JSON.stringify(data) : undefined });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'Request failed.');
  return value;
}
const node = (tag, text, className) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (className) n.className = className; return n; };
function button(label, action) {
  const b = node('button', label, 'secondary'); b.type = 'button';
  b.onclick = async () => { b.disabled = true; try { await action(); } catch (e) { status(e.message); } finally { b.disabled = false; } }; return b;
}
async function refresh() {
  const [overview, jobs, clients] = await Promise.all([api('/v1/overview'), api('/v1/jobs'), api('/v1/clients')]);
  const counts = Object.fromEntries(overview.counts.map(c => [c.state, c.count]));
  el('queued').textContent = counts.queued || 0; el('review').textContent = counts.review || 0;
  el('spent').textContent = '$' + (overview.reserved_micro_usd / 1e6).toFixed(2);
  el('cap').textContent = '$' + (overview.budget_cap_micro_usd / 1e6).toFixed(2);
  el('mode').textContent = overview.ai_enabled ? 'Model drafts enabled. Each draft requires review before release.' : 'AI spending is disabled. Data-quality jobs can run; model jobs wait in the queue.';
  el('jobs').replaceChildren();
  if (!jobs.length) el('jobs').append(node('p', 'No jobs yet. Create an assessment or project brief above.', 'small'));
  for (const job of jobs) {
    const card = node('article', undefined, 'job'), heading = node('div', undefined, 'job-header');
    heading.append(node('strong', services.find(s => s.id === job.service)?.title || job.service), node('span', job.state, 'tag ' + job.state));
    card.append(heading, node('p', job.id + ' · ' + new Date(job.created_at).toLocaleString(), 'small'));
    const details = node('details'); details.append(node('summary', 'View request'), node('pre', JSON.stringify(job.input, null, 2))); card.append(details);
    if (job.output) card.append(node('pre', job.output.draft || JSON.stringify(job.output, null, 2)));
    if (job.error) card.append(node('p', job.error, 'notice'));
    if (job.state === 'review') for (const action of ['approve', 'reject']) card.append(button(action === 'approve' ? 'Release to client' : 'Reject result', async () => {
      await api('/v1/jobs/' + job.id + '/' + action, 'POST'); await refresh(); status('Decision recorded.');
    }));
    if (job.state === 'queued') card.append(button('Cancel job', async () => { await api('/v1/jobs/' + job.id + '/cancel', 'POST'); await refresh(); }));
    el('jobs').append(card);
  }
  el('clients').replaceChildren();
  for (const client of clients) {
    const li = node('li'); li.append(node('span', client.name + (client.active ? '' : ' · revoked')));
    if (client.active) li.append(button('Revoke', async () => { await api('/v1/clients/' + client.id + '/revoke', 'POST'); await refresh(); status('Client access revoked.'); }));
    el('clients').append(li);
  }
  el('audit').replaceChildren();
  for (const event of overview.audit) { const li = node('li'); li.append(node('time', new Date(event.created_at).toLocaleString()), node('span', event.event + ' · ' + event.actor)); el('audit').append(li); }
}
function hint() { el('hint').textContent = services.find(s => s.id === el('service').value)?.input || ''; }
el('login-form').onsubmit = async event => {
  event.preventDefault(); token = el('token').value; el('token').value = '';
  try {
    services = await (await fetch('/v1/services')).json().then(x => x.services);
    el('service').replaceChildren(...services.map(s => { const o = node('option', s.title); o.value = s.id; return o; })); hint();
    await refresh(); el('workspace').hidden = false; el('login').hidden = true; status('Connected.');
  } catch (e) { token = ''; status(e.message); }
};
el('logout').onclick = () => {
  token = ''; el('workspace').hidden = true; el('login').hidden = false;
  el('jobs').replaceChildren(); el('clients').replaceChildren(); el('audit').replaceChildren();
  el('client-token').value = ''; el('issued').hidden = true; el('input').value = ''; status('Signed out.');
};
el('service').onchange = hint;
// Retain the same key across a network error; changing the payload starts a new request.
let lastSubmission;
el('job-form').onsubmit = async event => {
  event.preventDefault(); const b = event.submitter; b.disabled = true;
  try {
    const service = el('service').value;
    let input;
    if (service === 'data-quality') {
      const parsed = JSON.parse(el('input').value);
      const rows = Array.isArray(parsed) ? parsed : parsed?.rows;
      if (!Array.isArray(rows)) throw new Error('Enter a JSON object containing a rows array, or a JSON array of rows.');
      input = { rows };
    } else input = { text: el('input').value };
    const data = { service, input }; const fingerprint = JSON.stringify(data);
    if (lastSubmission?.fingerprint !== fingerprint) lastSubmission = { fingerprint, key: crypto.randomUUID() };
    await api('/v1/jobs', 'POST', data, lastSubmission.key); lastSubmission = undefined;
    el('input').value = ''; await refresh(); status('Job queued.');
  } catch (e) { status(e instanceof SyntaxError ? 'Enter valid JSON: an object containing rows, or an array of rows.' : e.message); } finally { b.disabled = false; }
};
el('client-form').onsubmit = async event => {
  event.preventDefault(); const b = event.submitter; b.disabled = true;
  try { const value = await api('/v1/clients', 'POST', { name: el('client-name').value });
    el('client-token').value = value.token; el('issued').hidden = false; el('client-name').value = ''; await refresh(); status('Client created. Copy their token.');
  } catch (e) { status(e.message); } finally { b.disabled = false; }
};
el('clear-token').onclick = () => { el('client-token').value = ''; el('issued').hidden = true; };
el('refresh').onclick = async () => { try { await refresh(); status('Updated.'); } catch (e) { status(e.message); } };
el('run').onclick = async () => {
  el('run').disabled = true;
  try { const value = await api('/v1/run', 'POST'); await refresh(); status(value.processed ? 'Job processed: ' + value.state : 'No eligible jobs.'); }
  catch (e) { status(e.message); } finally { el('run').disabled = false; }
};
