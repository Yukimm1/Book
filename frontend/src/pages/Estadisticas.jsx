import { useEffect, useState } from "react";
import api from "../api";
import StatsCards from "../components/StatsCards.jsx";

const pctDe = (l) => (l.paginas_totales > 0 ? Math.min(100, Math.round((l.paginas_leidas / l.paginas_totales) * 100)) : 0);

export default function Estadisticas() {
  const [libros, setLibros] = useState([]);
  const [estantes, setEstantes] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/libros/"), api.get("/estantes/")])
      .then(([l, e]) => { setLibros(l.data); setEstantes(e.data); })
      .catch(() => {});
  }, []);

  const max = Math.max(1, ...estantes.map((e) => e.total_libros));
  const enCurso = libros.filter((l) => pctDe(l) > 0 && pctDe(l) < 100);

  return (
    <>
      <h1 className="page-title">Estadísticas</h1>
      <StatsCards libros={libros} estantes={estantes} />

      <div className="panel">
        <h3>Libros por estante</h3>
        {estantes.map((e) => (
          <div className="row-bar" key={e.id}>
            <span>{e.nombre}</span>
            <div className="bar"><span style={{ width: `${(e.total_libros / max) * 100}%` }} /></div>
            <b>{e.total_libros}</b>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>Lecturas en curso</h3>
        {enCurso.length === 0 && <p className="muted-text">No tienes lecturas en curso todavía.</p>}
        {enCurso.map((l) => (
          <div className="row-bar" key={l.id}>
            <span>{l.titulo}</span>
            <div className="bar"><span style={{ width: `${pctDe(l)}%` }} /></div>
            <b>{pctDe(l)}%</b>
          </div>
        ))}
      </div>
    </>
  );
}
