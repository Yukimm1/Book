import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext.jsx";
import BookCard from "../components/BookCard.jsx";
import { Icon } from "../components/Icon.jsx";
import StatsCards from "../components/StatsCards.jsx";

const CATEGORIAS = ["Todos", "Ficción", "Desarrollo Personal", "Ciencia Ficción", "Historia", "Negocios"];
const ETIQUETAS = ["Recomendado", "Popular", "Destacado", "Imperdible"];

export default function Home() {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [libros, setLibros] = useState([]);
  const [estantes, setEstantes] = useState([]);

  useEffect(() => {
    setCargando(true);
    api.get("/books/featured/", { params: { cat } })
      .then((r) => setDestacados(r.data))
      .catch(() => setDestacados([]))
      .finally(() => setCargando(false));
  }, [cat]);

  useEffect(() => {
    if (!isAuth) return;
    Promise.all([api.get("/libros/"), api.get("/estantes/")])
      .then(([l, e]) => { setLibros(l.data); setEstantes(e.data); })
      .catch(() => {});
  }, [isAuth]);

  const buscar = (e) => {
    e.preventDefault();
    navigate(isAuth ? `/buscar?q=${encodeURIComponent(q)}` : "/login");
  };

  return (
    <>
      <section className="hero">
        <span className="pill"><Icon name="sparkles" size={14} /> Experiencia de lectura de nivel profesional</span>
        <h1>Tu biblioteca personal,<br /><span className="grad">reimaginada con elegancia.</span></h1>
        <p>Organiza, descubre y analiza tus hábitos de lectura en un espacio digital refinado y sin distracciones.</p>

        <form className="hero-search" onSubmit={buscar}>
          <Icon name="search" size={20} />
          <input placeholder="Buscar libros por título, autor o género..." value={q}
            onChange={(e) => setQ(e.target.value)} minLength={2} required />
          <button className="btn">Explorar</button>
        </form>

        <div className="chips">
          {CATEGORIAS.map((c) => (
            <button key={c} className={"chip" + (c === cat ? " active" : "")} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </section>

      {isAuth && <StatsCards libros={libros} estantes={estantes} />}

      <h2 className="section-title">Libros destacados del momento</h2>
      {cargando && <p className="muted-text">Cargando destacados…</p>}
      {!cargando && destacados.length === 0 && (
        <p className="muted-text">No se pudieron cargar los destacados por ahora.</p>
      )}
      <div className="grid">
        {destacados.map((l, i) => (
          <BookCard key={l.google_id} libro={l} badge={ETIQUETAS[i % ETIQUETAS.length]} />
        ))}
      </div>
    </>
  );
}
