import { Link } from "react-router";
import "../styles/pages/NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <h1 className="not-found-title">Page not found</h1>
      <Link className="not-found-link" to="/">
        Back to home
      </Link>
    </main>
  );
}
