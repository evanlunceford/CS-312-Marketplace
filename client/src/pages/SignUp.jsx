import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../api/httpClient.js";
import "../styles/pages/SignUp.css";

export default function SignUp() {
  const { currentUser, signUp } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ name: "", email: "", userId: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) return <Navigate to="/" replace />;

  function handleChange(event) {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await signUp(formValues);
      navigate("/");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard title="Sign up" errorMessage={errorMessage}>
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <label className="sign-up-label">
          Name
          <input
            className="sign-up-input"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            autoComplete="name"
            maxLength={100}
            required
          />
        </label>
        <label className="sign-up-label">
          Email
          <input
            className="sign-up-input"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>
        <label className="sign-up-label">
          User ID
          <input
            className="sign-up-input"
            name="userId"
            value={formValues.userId}
            onChange={handleChange}
            autoComplete="username"
            pattern="[A-Za-z0-9_]{3,30}"
            title="3-30 characters: letters, numbers and underscores"
            required
          />
        </label>
        <label className="sign-up-label">
          Password
          <input
            className="sign-up-input"
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </label>
        <button className="sign-up-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="sign-up-switch">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </AuthCard>
  );
}
