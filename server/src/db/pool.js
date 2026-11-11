import pg from "pg";
import { environment } from "../config/environment.js";

// PGHOST, PGPORT, PGUSER and PGPASSWORD are read from the environment by pg itself.
export const pool = new pg.Pool({ database: environment.databaseName });
