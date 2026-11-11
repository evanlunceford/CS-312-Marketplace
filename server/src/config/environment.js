// Single place that reads process.env so the rest of the server never touches it directly.
export const environment = {
  port: Number(process.env.PORT) || 8000,
  databaseName: process.env.PGDATABASE || "marketplace",
};
