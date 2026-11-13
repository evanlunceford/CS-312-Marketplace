import "../styles/components/AuthCard.css";

// Shared frame for the sign in and sign up screens.
export default function AuthCard({ title, errorMessage, children }) {
  return (
    <main className="auth-card">
      <h1 className="auth-card-title">{title}</h1>
      {errorMessage && (
        <p className="auth-card-error" role="alert">
          {errorMessage}
        </p>
      )}
      {children}
    </main>
  );
}
