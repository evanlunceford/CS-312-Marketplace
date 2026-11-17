import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as authApi from "../api/authApi.js";

const AuthContext = createContext(null);

// Holds the signed-in user for the whole app. currentUser is undefined while the first check runs,
// null when signed out, and { userId, name, email, createdAt } when signed in.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined);
  const authVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const version = authVersion.current;
    function finishSessionCheck(user) {
      if (active && authVersion.current === version) setCurrentUser(user);
    }
    authApi.getCurrentUser().then(finishSessionCheck).catch(() => finishSessionCheck(null));
    return () => { active = false; };
  }, []);

  async function signUp(details) {
    const user = await authApi.signUp(details);
    authVersion.current += 1;
    setCurrentUser(user);
  }

  async function signIn(credentials) {
    const user = await authApi.signIn(credentials);
    authVersion.current += 1;
    setCurrentUser(user);
  }

  async function signOut() {
    await authApi.signOut();
    authVersion.current += 1;
    setCurrentUser(null);
  }

  return <AuthContext.Provider value={{ currentUser, signUp, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
