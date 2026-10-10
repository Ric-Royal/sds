ALTER TABLE clients ADD COLUMN email TEXT;
ALTER TABLE clients ADD COLUMN organisation TEXT;
CREATE TABLE projects (
 id TEXT PRIMARY KEY, client_id TEXT NOT NULL, title TEXT NOT NULL, service TEXT NOT NULL,
 brief TEXT NOT NULL, input TEXT NOT NULL DEFAULT '{}', state TEXT NOT NULL DEFAULT 'enquiry',
 kind TEXT NOT NULL DEFAULT 'customer', quote_id TEXT, payment_state TEXT NOT NULL DEFAULT 'unquoted',
 idempotency_key TEXT NOT NULL, fingerprint TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 UNIQUE(client_id,idempotency_key)
);
CREATE INDEX projects_owner ON projects(client_id,created_at);
CREATE INDEX projects_state ON projects(state,created_at);
CREATE TABLE tasks (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), position INTEGER NOT NULL,
 role TEXT NOT NULL, engine TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending',
 input TEXT NOT NULL DEFAULT '{}', output TEXT, error TEXT, reservation_micro_usd INTEGER NOT NULL DEFAULT 0,
 started_at TEXT, updated_at TEXT NOT NULL, UNIQUE(project_id,position)
);
CREATE INDEX tasks_queue ON tasks(state,project_id,position);
CREATE TABLE quotes (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), version INTEGER NOT NULL,
 currency TEXT NOT NULL, amount_minor INTEGER NOT NULL CHECK(amount_minor>=0), scope TEXT NOT NULL,
 terms TEXT NOT NULL, expires_at TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'issued', accepted_at TEXT,
 created_at TEXT NOT NULL, UNIQUE(project_id,version)
);
CREATE TABLE payments (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), quote_id TEXT NOT NULL,
 provider TEXT NOT NULL, reference TEXT NOT NULL UNIQUE, currency TEXT NOT NULL,
 amount_minor INTEGER NOT NULL CHECK(amount_minor>0), actor TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE checkout_sessions (
 quote_id TEXT PRIMARY KEY, provider TEXT NOT NULL, provider_id TEXT NOT NULL UNIQUE,
 url TEXT NOT NULL, expires_at TEXT NOT NULL
);
CREATE TABLE payment_events (id TEXT PRIMARY KEY, received_at TEXT NOT NULL);
CREATE TABLE deliverables (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), name TEXT NOT NULL,
 mime TEXT NOT NULL, content TEXT NOT NULL, sha256 TEXT NOT NULL, created_at TEXT NOT NULL,
 encoding TEXT NOT NULL DEFAULT 'utf8',
 UNIQUE(project_id,name)
);
CREATE TABLE messages (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), actor TEXT NOT NULL,
 text TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE activity (
 id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT, event TEXT NOT NULL,
 actor TEXT NOT NULL, details TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
);
CREATE INDEX activity_project ON activity(project_id,id);
CREATE TABLE knowledge (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, url TEXT, text TEXT NOT NULL,
 approved INTEGER NOT NULL DEFAULT 0, fetched_at TEXT, created_at TEXT NOT NULL
);
CREATE TABLE schedules (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, service TEXT NOT NULL, brief TEXT NOT NULL,
 input TEXT NOT NULL, interval_hours INTEGER NOT NULL, next_run_at TEXT NOT NULL,
 enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
);
CREATE TABLE monitors (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL UNIQUE,
 interval_minutes INTEGER NOT NULL DEFAULT 60, next_run_at TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'unknown', http_status INTEGER, checked_at TEXT, incident_project TEXT
);
CREATE TABLE outbox (
 id TEXT PRIMARY KEY, project_id TEXT, channel TEXT NOT NULL, recipient TEXT NOT NULL,
 subject TEXT NOT NULL, content TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'review',
 provider_id TEXT, error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE webhook_subscriptions (
 client_id TEXT PRIMARY KEY, url TEXT NOT NULL, secret TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE webhook_deliveries (
 id TEXT PRIMARY KEY, client_id TEXT NOT NULL, project_id TEXT NOT NULL, event TEXT NOT NULL,
 payload TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt_at TEXT NOT NULL, last_status INTEGER, created_at TEXT NOT NULL,
 UNIQUE(project_id,event)
);
CREATE TABLE policy (
 key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE request_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0);
CREATE TABLE registration_requests (key_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, fingerprint TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE oauth_states (key_hash TEXT PRIMARY KEY, verifier TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE integrations (name TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE publications (id TEXT PRIMARY KEY, project_id TEXT, title TEXT NOT NULL, summary TEXT NOT NULL, content TEXT NOT NULL, published_at TEXT NOT NULL);
CREATE TABLE engineering_changes (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, base_sha TEXT NOT NULL,
 files TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'review', pull_request TEXT, created_at TEXT NOT NULL
);
