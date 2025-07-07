import React from 'react';
import { Link } from 'react-router-dom';

function PaginaNoEncontrada() {
  React.useEffect(() => {
    document.title = 'Página no encontrada | Sabor';
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) {
      meta.setAttribute('content', 'noindex, follow');
    } else {
      const metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      metaTag.content = 'noindex, follow';
      document.head.appendChild(metaTag);
    }
  }, []);

  return (
    <main className="pagina-no-encontrada" role="main" aria-label="Página no encontrada">
      <img
        src="/images/logo_sabor.png"
        alt="Logo Sabor"
        className="pagina-no-encontrada__icono"
        width="120"
        height="120"
        loading="lazy"
      />
      <h1 className="pagina-no-encontrada__titulo">404 - Página no encontrada</h1>
      <p className="pagina-no-encontrada__descripcion">
        Lo sentimos, la página que buscas no existe o ha sido movida.<br />
        Por favor, verifica la URL o vuelve al inicio.
      </p>
      <Link to="/" className="pagina-no-encontrada__boton" aria-label="Volver al inicio">
        Volver al inicio
      </Link>
    </main>
  );
}

export default PaginaNoEncontrada; 