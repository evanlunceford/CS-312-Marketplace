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

**Database changes.** Add a new numbered file in `server/src/db/migrations/` (`002_create_users.sql`, `003_create_listings.sql`, ...). Never edit a migration that is already on `main`; add a new one. If two people pick the same number, whoever merges second renumbers.

## Git workflow

- `main` always runs. Do not push to it directly.
- Branch per task: `feature/<short-name>` (for example `feature/listing-crud`, `feature/comments`).
- Open a pull request into `main` and have one teammate review it before merging.
- Pull `main` and run `npm run db:setup` after merging to pick up new migrations.

## Phases

- **Phase 1:** every core endpoint and the backend logic (authentication, listing CRUD with images, comments, profiles and transactions), plus basic unstyled screens for each.
- **Phase 2:** search and filtering, reviews and ratings, full responsive styling, seed data, testing and bug fixes.

See the project proposal for who owns each task.
