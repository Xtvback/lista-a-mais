CREATE TABLE document_content (
 document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
 content BLOB NOT NULL CHECK(length(content) <= 1800000)
);
CREATE TABLE mail_outbox (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL REFERENCES tokens(token_hash) ON DELETE CASCADE,
 encrypted_payload TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 lease_hash TEXT,
 lease_until INTEGER NOT NULL DEFAULT 0,
 delivered_at INTEGER,
 attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX ix_outbox_pending ON mail_outbox(delivered_at,expires_at,lease_until);
