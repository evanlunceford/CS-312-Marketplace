import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/authApi.js";

const AuthContext = createContext(null);

// Holds the signed-in user for the whole app. currentUser is undefined while the first check runs,
// null when signed out, and { userId, name, email, createdAt } when signed in.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    authApi
      .getCurrentUser()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  async function signUp(details) {
    setCurrentUser(await authApi.signUp(details));
  }

  async function signIn(credentials) {
    setCurrentUser(await authApi.signIn(credentials));
  }

  async function signOut() {
    await authApi.signOut();
    setCurrentUser(null);
  }

  return <AuthContext.Provider value={{ currentUser, signUp, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
