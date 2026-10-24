import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./AuthContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Biblioteca from "./pages/Biblioteca.jsx";
import Buscar from "./pages/Buscar.jsx";
import Estadisticas from "./pages/Estadisticas.jsx";

function Private({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/biblioteca" element={<Private><Biblioteca /></Private>} />
          <Route path="/buscar" element={<Private><Buscar /></Private>} />
          <Route path="/estadisticas" element={<Private><Estadisticas /></Private>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
