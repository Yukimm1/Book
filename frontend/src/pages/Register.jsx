import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { errorMsg } from "../api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/biblioteca");
    } catch (err) {
      setError(errorMsg(err));
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Crea tu cuenta</h2>
        <p className="muted-text">Empieza a organizar tus lecturas en segundos.</p>
        {error && <p className="error">{error}</p>}
        <input name="username" placeholder="Usuario" value={form.username} onChange={onChange} required />
        <input name="email" type="email" placeholder="Correo" value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder="Contraseña (mín. 8)" minLength={8} value={form.password} onChange={onChange} required />
        <button className="btn">Registrarme</button>
        <p className="muted-text">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </div>
  );
}
