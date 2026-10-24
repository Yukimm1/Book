import { createContext, useContext, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(localStorage.getItem("username"));

  const login = async (user, password) => {
    const { data } = await api.post("/auth/login/", { username: user, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("username", user);
    setUsername(user);
  };

  const register = async (form) => {
    await api.post("/auth/register/", form);
    await login(form.username, form.password);
  };

  const logout = () => {
    localStorage.clear();
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, isAuth: !!username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
