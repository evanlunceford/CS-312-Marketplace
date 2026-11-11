import { useEffect, useState } from "react";
import { getHealth } from "../api/healthApi.js";
import { getErrorMessage } from "../api/httpClient.js";
import "../styles/pages/Home.css";

// Placeholder landing page. It confirms the client, server and database are wired up.
export default function Home() {
  const [healthMessage, setHealthMessage] = useState("Checking server...");
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    getHealth()
      .then(() => {
        setIsHealthy(true);
        setHealthMessage("Server and database connected");
      })
      .catch((error) => setHealthMessage(getErrorMessage(error)));
  }, []);

  return (
    <main className="home-page">
      <h1 className="home-title">Marketplace</h1>
      <p className={isHealthy ? "home-status home-status-healthy" : "home-status home-status-unhealthy"}>
        {healthMessage}
      </p>
    </main>
  );
}
