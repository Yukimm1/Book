import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { errorMsg } from "../api";
import BookCard from "../components/BookCard.jsx";
import { Icon } from "../components/Icon.jsx";

export default function Buscar() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [resultados, setResultados] = useState([]);
  const [estantes, setEstantes] = useState([]);
  const [estanteId, setEstanteId] = useState("");
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const [cargando, setCargando] = useState(false);

  const ejecutar = useCallback(async (termino) => {
    setCargando(true); setMsg({ tipo: "", texto: "" });
    try {
      const { data } = await api.get("/books/search/", { params: { q: termino } });
      setResultados(data);
      if (data.length === 0) setMsg({ tipo: "muted-text", texto: "Sin resultados." });
    } catch (err) {
      setMsg({ tipo: "error", texto: errorMsg(err) });
    } finally { setCargando(false); }
  }, []);

  useEffect(() => {
    api.get("/estantes/").then((r) => {
      setEstantes(r.data);
      if (r.data[0]) setEstanteId(r.data[0].id);
    });
    const inicial = params.get("q");
    if (inicial && inicial.length >= 2) ejecutar(inicial);
  }, [params, ejecutar]);

  const buscar = (e) => { e.preventDefault(); ejecutar(q); };

  const agregar = async (l) => {
    try {
      await api.post("/libros/", {
        estante: Number(estanteId), google_id: l.google_id, titulo: l.titulo,
        autor: l.autor, portada: l.portada, paginas_totales: l.paginas_totales,
      });
      setMsg({ tipo: "ok", texto: `"${l.titulo}" agregado a tu biblioteca.` });
    } catch (err) {
      setMsg({ tipo: "error", texto: errorMsg(err) });
    }
  };

  return (
    <>
      <h1 className="page-title">Buscar en Google Books</h1>
      <form className="hero-search" onSubmit={buscar}>
        <Icon name="search" size={20} />
        <input placeholder="Título o autor" value={q} onChange={(e) => setQ(e.target.value)} minLength={2} required />
        <button className="btn" disabled={cargando}>{cargando ? "Buscando…" : "Buscar"}</button>
      </form>

      <label className="sort target">
        Agregar al estante:
        <select value={estanteId} onChange={(e) => setEstanteId(e.target.value)}>
          {estantes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </label>

      {msg.texto && <p className={msg.tipo}>{msg.texto}</p>}
      <div className="grid">
        {resultados.map((l) => (
          <BookCard key={l.google_id} libro={l}>
            <p className="synopsis">{l.sinopsis?.slice(0, 110)}{l.sinopsis?.length > 110 ? "…" : ""}</p>
            <button className="btn btn-sm" onClick={() => agregar(l)}><Icon name="plus" size={16} /> Agregar</button>
          </BookCard>
        ))}
      </div>
    </>
  );
}
