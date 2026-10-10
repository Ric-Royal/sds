CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  service TEXT NOT NULL,
  input TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'queued',
  output TEXT,
  error TEXT,
  reservation_micro_usd INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(client_id, idempotency_key)
);
CREATE INDEX jobs_queue ON jobs(state, created_at);
CREATE INDEX jobs_client ON jobs(client_id, created_at);
CREATE TABLE budget (
  month TEXT PRIMARY KEY,
  reserved_micro_usd INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT,
  event TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL
);
