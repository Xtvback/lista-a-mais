CREATE TABLE IF NOT EXISTS members (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 member_number TEXT NOT NULL UNIQUE,
 email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 full_name TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')),
 password_hash TEXT,
 password_salt TEXT,
 created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS tokens (
 token_hash TEXT PRIMARY KEY,
 member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 purpose TEXT NOT NULL CHECK(purpose IN ('reset','session')),
 expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS ix_tokens_member ON tokens(member_id);
CREATE TABLE IF NOT EXISTS documents (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 category TEXT NOT NULL DEFAULT 'Documentação',
 r2_key TEXT NOT NULL UNIQUE,
 active INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL DEFAULT (unixepoch())
);