export default function BookCard({ libro, badge, estado, progreso, children }) {
  return (
    <article className="book">
      <div className="book-tags">
        {badge ? <span className="tag tag-purple">{badge}</span> : <span />}
        {estado && <span className={`tag tag-${estado.tono || "blue"}`}>{estado.texto}</span>}
      </div>

      <div className="cover">
        {libro.portada ? (
          <img src={libro.portada} alt={`Portada de ${libro.titulo}`} loading="lazy" />
        ) : (
          <div className="cover-fallback">{libro.titulo?.[0]}</div>
        )}
      </div>

      <h4 title={libro.titulo}>{libro.titulo}</h4>
      <p className="author">{libro.autor}</p>
      {libro.paginas_totales > 0 && <p className="pages">{libro.paginas_totales} páginas</p>}

      {progreso != null && (
        <div className="progress">
          <div className="progress-top"><span>Progreso</span><span>{progreso}%</span></div>
          <div className="bar"><span style={{ width: `${progreso}%` }} /></div>
        </div>
      )}

      {children && <div className="book-actions">{children}</div>}
    </article>
  );
}
