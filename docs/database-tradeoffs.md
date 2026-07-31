# Database Tradeoffs

**Choice:** Supabase (managed Postgres) accessed via `@supabase/supabase-js`.

**Rationale:**
- Decouples persistence from the EC2 instance so a database issue does not impact the server and vice versa.
- Avoids the risk of running a full database system on the minimal EC2 image alongside the application.
- The store is abstracted behind `src/db/lead/`, making it straightforward to swap the persistence layer (e.g. AWS RDS) without touching route logic.

**Limitations:**
- Free tier (500 MB, pauses after 1 week of inactivity) — suitable for stakeholder preview, not production.
- Requires outbound HTTPS from EC2 to `supabase.co`. Lead creation fails if that connection is unavailable.
- The service role key has full table access and must remain in `.env` (gitignored).
