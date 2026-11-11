import { Router } from "express";
import { pool } from "../db/pool.js";
import { HttpError } from "../utils/httpError.js";

export const healthRoutes = Router();

// GET /api/health -> confirms the server is up and can reach Postgres.
healthRoutes.get("/health", async (request, response) => {
  try {
    await pool.query("SELECT 1");
  } catch (error) {
    throw new HttpError(503, "check health", `database is unreachable (${error.message})`);
  }
  response.json({ status: "ok", database: "connected" });
});
