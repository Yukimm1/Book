import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      navigate("/biblioteca");
    } catch {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Bienvenido de vuelta</h2>
        <p className="muted-text">Inicia sesión para ver tu biblioteca.</p>
        {error && <p className="error">{error}</p>}
        <input name="username" placeholder="Usuario" value={form.username} onChange={onChange} required />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={onChange} required />
        <button className="btn">Entrar</button>
        <p className="muted-text">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
      </form>
    </div>
  );
}
