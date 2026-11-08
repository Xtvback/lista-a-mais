ALTER TABLE members ADD COLUMN credential_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tokens ADD COLUMN credential_version INTEGER;
CREATE INDEX IF NOT EXISTS ix_tokens_expiry ON tokens(expires_at);
CREATE TABLE IF NOT EXISTS rate_limits (
 bucket_key TEXT PRIMARY KEY,
 attempts INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_rate_expiry ON rate_limits(expires_at);
