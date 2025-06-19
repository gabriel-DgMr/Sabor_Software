import React from 'react';
import { AiFillInstagram } from 'react-icons/ai';
import { BsTwitterX } from 'react-icons/bs';
import { FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
      <footer className="pie-pagina">
        <div className="pie-pagina__contacto">
          <h3 className="pie-pagina__titulo">Contáctanos</h3>
          <h4 className="pie-pagina__subtitulo">Nuestras redes sociales</h4>
          <div className="pie-pagina__redes">
            <div className="pie-pagina__icono-red">
              <FaFacebook size={32} />
            </div>
            <div className="pie-pagina__icono-red">
              <FaTiktok size={32} />
            </div>
            <div className="pie-pagina__icono-red">
              <AiFillInstagram size={32} />
            </div>
            <div className="pie-pagina__icono-red">
              <BsTwitterX size={32} />
            </div>
            <div className="pie-pagina__icono-red">
              <FaYoutube size={32} />
            </div>
          </div>
        </div>

        <div className="pie-pagina__nosotros">
          <h3 className="pie-pagina__titulo">Sobre Nosotros</h3>
          <h4 className="pie-pagina__subtitulo">
            <a href="#" className='nosotros-opc'>¿Quiénes somos?</a>
            <a href="#" className='nosotros-opc'>Descubrenos </a>
          </h4>
        </div>
        <div className="cuentanos">
          <h3 className="pie-pagina__titulo">¡Cuentanos!</h3>
          <textarea className='cuentanos__input' placeholder='¡Tu experiencia!'/>
        </div>
      </footer>
  );
};

export default Footer;