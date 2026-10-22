-- Local-first sync: link a browser-local project to its cloud row.
--
-- The editor stores every project in localStorage first so the app works
-- with no account. When the user signs in, the project is mirrored into
-- `projects` and matched back through `local_id`, so the local id stays
-- stable across devices and in the URL.

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS local_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_local_id_unique
  ON public.projects (local_id) WHERE local_id IS NOT NULL;

-- The owner's own projects remain the only ones visible to them.
CREATE INDEX IF NOT EXISTS idx_projects_local_id ON public.projects(local_id);
