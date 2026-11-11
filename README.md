# CS 312 Online Marketplace

A local second-hand marketplace built on the PERN stack (PostgreSQL, Express, React, Node). Users list items for sale, browse and filter listings, comment on active listings, and review each other after a transaction.

**Team:** Evan Lunceford, Rudy Ochoa, Elijah Graham

## Getting started

Prerequisites: Node 22+ and a running PostgreSQL server.

```bash
git clone <repo-url>
cd CS-312-Marketplace
npm install                 # installs root, server and client dependencies (npm workspaces)
cp .env.example .env        # then fill in your Postgres password
npm run db:setup            # creates the database and runs any new migrations + seeds
npm run dev                 # Express on :8000, Vite on :5173 (proxies /api to Express)
```

Open http://localhost:5173. The home page should say "Server and database connected".

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs the server (auto-restart) and the Vite dev server together |
| `npm run db:setup` | Creates the database if missing, applies new migrations, runs seeds |
| `npm run build` | Builds the React app into `client/dist` |
| `npm start` | Runs the server only; serves the built client if `client/dist` exists |

## Project structure

```
server/src/
  app.js                Express app: middleware, /api routes, static client, error handler
  server.js             Starts the server
  config/environment.js The only file that reads process.env
  db/
    pool.js             Shared pg connection pool
    setup.js            Creates the database, runs migrations and seeds
    migrations/         Numbered .sql files, applied once each, in order
    seeds/              Demo data, run on every db:setup (write them to be re-runnable)
  routes/               Express routers: URL + HTTP method -> controller
  controllers/          Read the request, call a service, send the response
  services/             Business rules and validation (pre/post conditions live here)
  repositories/         SQL queries only; no business logic
  middleware/           Shared middleware (error handling, and auth once it exists)
  utils/httpError.js    Throw for any expected error

client/src/
  api/                  One module per feature (listingApi.js, ...) built on httpClient.js
  components/           Reusable components
  pages/                One component per route
  styles/
    variables.css       Global colors, fonts, radii, spacing. Use these, never hard-coded values.
    global.css          Resets and base element styles
    components/         One CSS file per component, mirroring components/
    pages/              One CSS file per page, mirroring pages/
```

## Conventions

**Layering.** A request flows `route -> controller -> service -> repository`. Each layer only calls the one below it. Services check pre-conditions (valid input, the record exists, the user is allowed) before acting and post-conditions (the write actually happened, the result has the expected shape) after.

**Errors.** Every error message uses the form `Failed to <action>: <reason>`. On the server, `throw new HttpError(404, "load listing", "listing 42 does not exist")`. The error handler turns it into `{ "error": "Failed to load listing: listing 42 does not exist" }` with the matching status code. On the client, use `getErrorMessage(error)` from `api/httpClient.js` to display it.

**Naming.** Use descriptive names: no single-letter variables and no abbreviations (`listing`, not `l`; `request`, not `req`). Endpoints are plural REST resources: `GET /api/listings`, `GET /api/listings/:listingId`, `POST /api/listings`, `PUT /api/listings/:listingId`, `DELETE /api/listings/:listingId`. Files are named `<feature><Layer>.js` (`listingService.js`, `listingRepository.js`, `listingController.js`, `listingRoutes.js`).

**CSS.** Each component or page gets its own CSS file under `styles/`, mirroring its path. Class names are kebab-case and prefixed with the component name (`listing-card`, `listing-card-price`). No inline styles unless a value is truly dynamic.

## Database migrations

A migration is a `.sql` file that changes the database structure: creating a table, adding a column, adding an index. Migrations live in `server/src/db/migrations/` and are how everyone's local database stays in sync. **Never change tables by hand in pgAdmin or psql.** If it isn't in a migration, nobody else's database will have it.

### How it works

`npm run db:setup` does three things:

1. Creates the `marketplace` database if it doesn't exist.
2. Runs every file in `migrations/` that hasn't run on your machine yet, in filename order. Each file that runs is recorded in a `schema_migrations` table, so it never runs twice.
3. Runs every file in `seeds/` (demo data). Seeds run **every time**, so they must be safe to re-run (see below).

Each migration runs inside a transaction. If any statement fails, the whole file is rolled back, nothing is recorded, and you'll see `Failed to apply migration <file>: <reason>`. Fix the SQL and run `npm run db:setup` again.

### Adding a migration

1. Pull the latest `main` so you can see the highest number already used.
2. Create a new file with the next number and a short description, in snake_case:
   ```
   server/src/db/migrations/002_create_users.sql
   ```
3. Write the SQL. Example only:
   ```sql
   CREATE TABLE example_items (
     example_item_id SERIAL PRIMARY KEY,
     owner_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     price_in_cents INTEGER NOT NULL CHECK (price_in_cents >= 0),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```
4. Run it: `npm run db:setup`. You should see `Applied migration 002_create_users.sql`.
5. Commit the file with the code that uses it.

### Rules

- **Never edit a migration after it's been pushed.** Your teammates have already run it, so your edit will never reach their databases. To change a table, add a new migration (`ALTER TABLE ... ADD COLUMN ...`).
- **One feature per file.** Don't put users and listings in the same migration.
- **Order matters.** A table with a foreign key must come after the table it references. Listings need users to exist first.
- **Number collisions.** If you and a teammate both create `003_...`, whoever merges second renames theirs to the next free number before merging.
- Put constraints (`NOT NULL`, `CHECK`, `UNIQUE`, foreign keys) in the database, not just in the service layer.

### Seeds

Seed files in `server/src/db/seeds/` insert demo data. They run on every `db:setup`, so write them so running twice doesn't duplicate or crash:

```sql
INSERT INTO example_items (example_item_id, owner_user_id, title, price_in_cents)
VALUES (1, 1, 'Desk lamp', 1500)
ON CONFLICT (example_item_id) DO NOTHING;
```

### Starting over

If your local database gets into a bad state, drop it and rebuild it from the migrations. This deletes all your local data:

```bash
psql -U postgres -c "DROP DATABASE marketplace;"
npm run db:setup
```

### After pulling

Whenever you pull `main` and someone has added a migration, run `npm run db:setup` again. If you get errors like `relation "users" does not exist`, you probably skipped this step.


## Phases

- **Phase 1:** every core endpoint and the backend logic (authentication, listing CRUD with images, comments, profiles and transactions), plus basic unstyled screens for each.
- **Phase 2:** search and filtering, reviews and ratings, full responsive styling, seed data, testing and bug fixes.

See the project proposal for who owns each task.
