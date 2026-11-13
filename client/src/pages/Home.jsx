import { useEffect, useState } from "react";
import { getHealth } from "../api/healthApi.js";
import { getErrorMessage } from "../api/httpClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/pages/Home.css";

// Placeholder landing page. It confirms the client, server and database are wired up
// and shows who is signed in. Teammates replace the body with the listings browse view.
export default function Home() {
  const { currentUser, signOut } = useAuth();
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
      <p className="home-user">
        Signed in as {currentUser.name} ({currentUser.userId}){" "}
        <button className="home-sign-out-button" type="button" onClick={signOut}>
          Sign out
        </button>
      </p>
      <p className={isHealthy ? "home-status home-status-healthy" : "home-status home-status-unhealthy"}>
        {healthMessage}
      </p>
    </main>
  );
}
