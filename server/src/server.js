import { app } from "./app.js";
import { environment } from "./config/environment.js";

app.listen(environment.port, () => {
  console.log(`Marketplace API running at http://localhost:${environment.port}`);
});
