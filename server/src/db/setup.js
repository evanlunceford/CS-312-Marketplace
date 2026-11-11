// Creates the database if needed, runs every migration in db/migrations that has not
// run yet (in filename order), then runs every seed file in db/seeds.
// Name new migrations with the next number: 002_create_users.sql, 003_create_listings.sql, etc.
import pg from "pg";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { environment } from "../config/environment.js";

const databaseDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(databaseDirectory, "migrations");
const seedsDirectory = path.join(databaseDirectory, "seeds");

async function listSqlFiles(directory) {
  const fileNames = await fs.readdir(directory);
  return fileNames.filter((fileName) => fileName.endsWith(".sql")).sort();
}

async function createDatabaseIfMissing() {
  const adminClient = new pg.Client({ database: "postgres" });
  await adminClient.connect();
  try {
    const existingDatabase = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      environment.databaseName,
    ]);
    if (existingDatabase.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${pg.escapeIdentifier(environment.databaseName)}`);
      console.log(`Created database ${environment.databaseName}`);
    }
  } finally {
    await adminClient.end();
  }
}

async function runPendingMigrations(databaseClient) {
  await databaseClient.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      file_name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const appliedResult = await databaseClient.query("SELECT file_name FROM schema_migrations");
  const appliedFileNames = new Set(appliedResult.rows.map((row) => row.file_name));

  for (const fileName of await listSqlFiles(migrationsDirectory)) {
    if (appliedFileNames.has(fileName)) continue;
    const migrationSql = await fs.readFile(path.join(migrationsDirectory, fileName), "utf8");
    await databaseClient.query("BEGIN");
    try {
      await databaseClient.query(migrationSql);
      await databaseClient.query("INSERT INTO schema_migrations (file_name) VALUES ($1)", [fileName]);
      await databaseClient.query("COMMIT");
      console.log(`Applied migration ${fileName}`);
    } catch (error) {
      await databaseClient.query("ROLLBACK");
      throw new Error(`Failed to apply migration ${fileName}: ${error.message}`);
    }
  }
}

async function runSeeds(databaseClient) {
  for (const fileName of await listSqlFiles(seedsDirectory)) {
    await databaseClient.query(await fs.readFile(path.join(seedsDirectory, fileName), "utf8"));
    console.log(`Ran seed ${fileName}`);
  }
}

try {
  await createDatabaseIfMissing();
  const databaseClient = new pg.Client({ database: environment.databaseName });
  await databaseClient.connect();
  try {
    await runPendingMigrations(databaseClient);
    await runSeeds(databaseClient);
    console.log(`${environment.databaseName} is ready`);
  } finally {
    await databaseClient.end();
  }
} catch (error) {
  const message = error.message.startsWith("Failed to") ? error.message : `Failed to set up database: ${error.message}`;
  console.error(message);
  process.exitCode = 1;
}
