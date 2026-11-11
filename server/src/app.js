import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiRoutes } from "./routes/index.js";
import { handleError, handleNotFound } from "./middleware/errorHandler.js";

const serverSourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientBuildDirectory = path.join(serverSourceDirectory, "../../client/dist");

export const app = express();

app.use(express.json());

app.use("/api", apiRoutes);
app.use("/api", handleNotFound);

// After `npm run build`, serve the React app; unknown paths get index.html so React Router can handle them.
app.use(express.static(clientBuildDirectory));
app.get("/{*path}", (request, response) => response.sendFile(path.join(clientBuildDirectory, "index.html")));

app.use(handleError);
