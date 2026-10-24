import { useCallback, useEffect, useMemo, useState } from "react";
import api, { errorMsg } from "../api";
import BookCard from "../components/BookCard.jsx";
import { Icon } from "../components/Icon.jsx";
import StatsCards from "../components/StatsCards.jsx";

const pctDe = (l) => (l.paginas_totales > 0 ? Math.min(100, Math.round((l.paginas_leidas / l.paginas_totales) * 100)) : 0);
const estadoDe = (l) => {
  const p = pctDe(l);
  if (p >= 100) return { texto: "Completado", tono: "green" };
  if (p > 0) return { texto: "En curso", tono: "amber" };
  return { texto: "Pendiente", tono: "blue" };
};

export default function Biblioteca() {
  const [estantes, setEstantes] = useState([]);
  const [libros, setLibros] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [orden, setOrden] = useState("recientes");
  const [nuevo, setNuevo] = useState("");
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const [e, l] = await Promise.all([api.get("/estantes/"), api.get("/libros/")]);
      setEstantes(e.data);
      setLibros(l.data);
    } catch (err) { setError(errorMsg(err)); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const visibles = useMemo(() => {
    const r = filtro === "todos" ? [...libros] : libros.filter((l) => l.estante === filtro);
    if (orden === "titulo") r.sort((a, b) => a.titulo.localeCompare(b.titulo));
    if (orden === "progreso") r.sort((a, b) => pctDe(b) - pctDe(a));
    return r;
  }, [libros, filtro, orden]);

  const crearEstante = async (e) => {
    e.preventDefault();
    try { await api.post("/estantes/", { nombre: nuevo }); setNuevo(""); setError(""); cargar(); }
    catch (err) { setError(errorMsg(err)); }
  };

  const borrarEstante = async () => {
    if (!confirm("¿Eliminar este estante y todos sus libros?")) return;
    await api.delete(`/estantes/${filtro}/`);
    setFiltro("todos"); cargar();
  };

  const borrarLibro = async (id) => {
    if (!confirm("¿Eliminar este libro?")) return;
    await api.delete(`/libros/${id}/`); cargar();
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/libros/${editando.id}/`, {
        paginas_leidas: Number(editando.paginas_leidas),
        notas: editando.notas,
        estante: Number(editando.estante),
      });
      setEditando(null); setError(""); cargar();
    } catch (err) { setError(errorMsg(err)); }
  };

  return (
    <>
      <h1 className="page-title">Mi biblioteca</h1>
      <StatsCards libros={libros} estantes={estantes} />
      {error && <p className="error">{error}</p>}

      <div className="toolbar">
        <div className="chips">
          <button className={"chip" + (filtro === "todos" ? " active" : "")} onClick={() => setFiltro("todos")}>
            Todos los estados
          </button>
          {estantes.map((s) => (
            <button key={s.id} className={"chip" + (filtro === s.id ? " active" : "")} onClick={() => setFiltro(s.id)}>
              {s.nombre} <small>({s.total_libros})</small>
            </button>
          ))}
        </div>
        <label className="sort">
          <Icon name="sort" size={16} /> Ordenar por:
          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">Más recientes</option>
            <option value="titulo">Título (A-Z)</option>
            <option value="progreso">Mayor progreso</option>
          </select>
        </label>
      </div>

      <div className="toolbar">
        <form className="inline" onSubmit={crearEstante}>
          <input placeholder="Nuevo estante (ej. Ciencia ficción)" value={nuevo}
            onChange={(e) => setNuevo(e.target.value)} required />
          <button className="btn btn-sm"><Icon name="plus" size={16} /> Crear estante</button>
        </form>
        {filtro !== "todos" && (
          <button className="btn btn-danger btn-sm" onClick={borrarEstante}>Eliminar estante</button>
        )}
      </div>

      {visibles.length === 0 && <p className="muted-text">Aún no hay libros aquí. Búscalos en la pestaña Buscar.</p>}
      <div className="grid">
        {visibles.map((l) => (
          <BookCard key={l.id} libro={l} badge={l.estante_nombre} estado={estadoDe(l)} progreso={pctDe(l)}>
            {l.notas && <p className="notes">📝 {l.notas}</p>}
            <button className="btn btn-ghost btn-sm" onClick={() => setEditando({ ...l })}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={() => borrarLibro(l.id)}>Borrar</button>
          </BookCard>
        ))}
      </div>

      {editando && (
        <div className="modal" onClick={() => setEditando(null)}>
          <form className="auth-card" onSubmit={guardar} onClick={(e) => e.stopPropagation()}>
            <h3>{editando.titulo}</h3>
            <label>Páginas leídas
              <input type="number" min="0" max={editando.paginas_totales || undefined}
                value={editando.paginas_leidas}
                onChange={(e) => setEditando({ ...editando, paginas_leidas: e.target.value })} />
            </label>
            <label>Estante
              <select value={editando.estante} onChange={(e) => setEditando({ ...editando, estante: e.target.value })}>
                {estantes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </label>
            <label>Notas
              <textarea maxLength={2000} value={editando.notas}
                onChange={(e) => setEditando({ ...editando, notas: e.target.value })} />
            </label>
            <button className="btn">Guardar</button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditando(null)}>Cancelar</button>
          </form>
        </div>
      )}
    </>
  );
}
