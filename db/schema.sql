CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  procedure_slug TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  price INTEGER NOT NULL,
  year INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reports_lookup ON reports (procedure_slug, city_slug);

CREATE TABLE IF NOT EXISTS published_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  procedure_slug TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  low INTEGER NOT NULL,
  high INTEGER NOT NULL,
  label TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  as_of TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_published_lookup ON published_prices (procedure_slug, city_slug);
