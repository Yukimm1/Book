import { Icon } from "./Icon.jsx";

export function calcStats(libros, estantes) {
  const nombre = (id) => (estantes.find((e) => e.id === id)?.nombre || "").toLowerCase();
  const leyendo = libros.filter((l) => nombre(l.estante).includes("leyendo")).length;
  const completados = libros.filter(
    (l) => nombre(l.estante).includes("terminad") ||
      (l.paginas_totales > 0 && l.paginas_leidas >= l.paginas_totales)
  ).length;
  const paginas = libros.reduce((s, l) => s + (l.paginas_leidas || 0), 0);
  return { total: libros.length, leyendo, completados, paginas };
}

export default function StatsCards({ libros, estantes }) {
  const s = calcStats(libros, estantes);
  const items = [
    { icon: "library", color: "indigo", n: s.total, label: "Libros guardados" },
    { icon: "bookmark", color: "amber", n: s.leyendo, label: "Leyendo ahora" },
    { icon: "check", color: "green", n: s.completados, label: "Completados" },
    { icon: "flame", color: "purple", n: s.paginas.toLocaleString("es"), label: "Páginas leídas" },
  ];
  return (
    <div className="stats">
      {items.map((i) => (
        <div className="stat" key={i.label}>
          <span className={`stat-icon ${i.color}`}><Icon name={i.icon} size={22} /></span>
          <div><b>{i.n}</b><small>{i.label}</small></div>
        </div>
      ))}
    </div>
  );
}
