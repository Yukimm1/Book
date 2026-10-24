import { useEffect, useState } from "react";
import { Icon } from "./Icon.jsx";

function leerTema() {
  try { return localStorage.getItem("theme") || "dark"; } catch { return "dark"; }
}

export default function ThemeToggle() {
  const [tema, setTema] = useState(leerTema);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try { localStorage.setItem("theme", tema); } catch { /* sin almacenamiento */ }
  }, [tema]);

  return (
    <button className="icon-btn" title="Cambiar tema" onClick={() => setTema(tema === "dark" ? "light" : "dark")}>
      <Icon name={tema === "dark" ? "sun" : "moon"} />
    </button>
  );
}
