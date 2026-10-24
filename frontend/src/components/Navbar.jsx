import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";
import { Icon } from "./Icon.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const item = ({ isActive }) => "nav-item" + (isActive ? " active" : "");

export default function Navbar() {
  const { isAuth, username, logout } = useAuth();
  const [total, setTotal] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) { setTotal(0); return; }
    api.get("/libros/").then((r) => setTotal(r.data.length)).catch(() => {});
  }, [isAuth, pathname]);

  const salir = () => { logout(); navigate("/"); };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-logo"><Icon name="book" size={22} /></span>
        <span>
          <strong>Book<em>Verse</em></strong>
          <small>EDITION PRO</small>
        </span>
      </Link>

      <nav className="nav-pill">
        <NavLink to="/" end className={item}><Icon name="compass" size={16} /> Explorar</NavLink>
        <NavLink to="/biblioteca" className={item}>
          <Icon name="library" size={16} /> Mi Biblioteca
          {isAuth && <span className="badge-count">{total}</span>}
        </NavLink>
        <NavLink to="/buscar" className={item}><Icon name="search" size={16} /> Buscar</NavLink>
        <NavLink to="/estadisticas" className={item}><Icon name="chart" size={16} /> Estadísticas</NavLink>
      </nav>

      <div className="nav-right">
        <ThemeToggle />
        {isAuth ? (
          <>
            <span className="avatar" title={username}>
              {username?.slice(0, 2).toUpperCase()}<i />
            </span>
            <button className="btn btn-ghost btn-sm" onClick={salir}>Salir</button>
          </>
        ) : (
          <>
            <Link className="btn btn-ghost btn-sm" to="/login">Iniciar sesión</Link>
            <Link className="btn btn-sm" to="/register">Crear cuenta</Link>
          </>
        )}
      </div>
    </header>
  );
}
