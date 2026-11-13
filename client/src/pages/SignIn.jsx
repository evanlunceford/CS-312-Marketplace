import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../api/httpClient.js";
import "../styles/pages/SignIn.css";

export default function SignIn() {
  const { currentUser, signIn } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await signIn({ userId, password });
      navigate("/");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard title="Sign in" errorMessage={errorMessage}>
      <form className="sign-in-form" onSubmit={handleSubmit}>
        <label className="sign-in-label">
          User ID
          <input
            className="sign-in-input"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="sign-in-label">
          Password
          <input
            className="sign-in-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button className="sign-in-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="sign-in-switch">
        No account yet? <Link to="/signup">Sign up</Link>
      </p>
    </AuthCard>
  );
}
