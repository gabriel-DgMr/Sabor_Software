import React, { useState, useEffect } from 'react';

import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ANIM_DURATION, VISIBLE_DURATION, animateElements } from '../utils/animationUtils.js';
import { validarCaracteresEspeciales } from '../utils/validaciones.js';

const ActualizarDatos = () => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    document.title = 'Actualizar datos | Sabor';
    if (user) {
      setNombre(user.nombre_cliente || '');
      setCorreo(user.email_cliente || '');
      setTelefono(user.telefono_cliente || '');
    }
  }, [user]);

  const manejarErroresDeCampo = newErrors => {
    setErrors(newErrors);
    setTimeout(() => {
      document.querySelectorAll('.actualizar-datos__campo .actualizar-datos__mensaje-error').forEach(el => {
        animateElements(el, 'fade-in');
      });
    }, 0);

    setTimeout(() => {
      document.querySelectorAll('.actualizar-datos__campo .actualizar-datos__mensaje-error').forEach(el => {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
      });
      setTimeout(() => setErrors({}), ANIM_DURATION);
    }, VISIBLE_DURATION);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setGlobalError('');
    setErrors({});

    const newErrors = {};

    const errorNombre = validarCaracteresEspeciales(nombre, 'nombre');
    if (errorNombre) {
      newErrors.nombre = errorNombre;
    } else if (!nombre) {
      newErrors.nombre = 'El nombre es obligatorio.';
    }

    const errorCorreo = validarCaracteresEspeciales(correo, 'correo');
    if (errorCorreo) {
      newErrors.correo = errorCorreo;
    } else if (!correo) {
      newErrors.correo = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      newErrors.correo = 'El formato del correo no es válido.';
    }

    const errorTelefono = validarCaracteresEspeciales(telefono, 'teléfono');
    if (errorTelefono) {
      newErrors.telefono = errorTelefono;
    } else if (!telefono) {
      newErrors.telefono = 'El teléfono es obligatorio.';
    } else if (!/^\d{10}$/.test(telefono)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos.';
    }

    if (Object.keys(newErrors).length > 0) {
      manejarErroresDeCampo(newErrors);
      return;
    }

    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/auth/actualizarcliente/${user.id_cliente}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_cliente: nombre,
          email_cliente: correo,
          telefono_cliente: telefono,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMensaje('¡Datos actualizados correctamente!');
        setTimeout(() => animateElements('#mensaje-exito-actualizar', 'fade-in'), 0);
        setTimeout(() => {
          const el = document.querySelector('#mensaje-exito-actualizar');
          if (el) {
            el.classList.remove('fade-in');
            el.classList.add('fade-out');
          }
          setTimeout(() => setMensaje(''), ANIM_DURATION);
        }, VISIBLE_DURATION);
      } else {
        console.error(data);
        setGlobalError(data.message || 'Error al actualizar los datos.');
        setTimeout(() => animateElements('#mensaje-error-actualizar', 'fade-in'), 0);
        setTimeout(() => {
          const el = document.querySelector('#mensaje-error-actualizar');
          if (el) {
            el.classList.remove('fade-in');
            el.classList.add('fade-out');
          }
          setTimeout(() => setGlobalError(''), ANIM_DURATION);
        }, VISIBLE_DURATION);
      }
    } catch {
      setGlobalError('Error de conexión con el servidor.');
      setTimeout(() => animateElements('#mensaje-error-actualizar', 'fade-in'), 0);
      setTimeout(() => {
        const el = document.querySelector('#mensaje-error-actualizar');
        if (el) {
          el.classList.remove('fade-in');
          el.classList.add('fade-out');
        }
        setTimeout(() => setGlobalError(''), ANIM_DURATION);
      }, VISIBLE_DURATION);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="actualizar-datos">
        <section className="actualizar-datos__contenedor">
          <h1 className="actualizar-datos__titulo">Actualizar datos</h1>
          <form className="actualizar-datos__formulario" onSubmit={handleSubmit} autoComplete="off">
            <div className="actualizar-datos__campo">
              <label htmlFor="nombre" className="actualizar-datos__label">Nombre</label>
              <input
                id="nombre"
                className={`actualizar-datos__input ${errors.nombre ? 'input--error' : ''}`}
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
              />
              {errors.nombre && <p className="actualizar-datos__mensaje-error">{errors.nombre}</p>}
            </div>
            <div className="actualizar-datos__campo">
              <label htmlFor="correo" className="actualizar-datos__label">Correo electrónico</label>
              <input
                id="correo"
                className={`actualizar-datos__input ${errors.correo ? 'input--error' : ''}`}
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
              />
              {errors.correo && <p className="actualizar-datos__mensaje-error">{errors.correo}</p>}
            </div>
            <div className="actualizar-datos__campo">
              <label htmlFor="telefono" className="actualizar-datos__label">Teléfono</label>
              <input
                id="telefono"
                className={`actualizar-datos__input ${errors.telefono ? 'input--error' : ''}`}
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="Tu teléfono (10 dígitos)"
                required
                maxLength={10}
              />
              {errors.telefono && <p className="actualizar-datos__mensaje-error">{errors.telefono}</p>}
            </div>
            <div className="actualizar-datos__campo">
              <label htmlFor="contrasena" className="actualizar-datos__label">Nueva contraseña</label>
              <input
                id="contrasena"
                className="actualizar-datos__input"
                type="password"
                placeholder="Para cambiar la contraseña, usa la opción de recuperación."
                disabled
              />
              <small className="actualizar-datos__ayuda">Para cambiar la contraseña, utiliza la opción de recuperación de contraseña.</small>
            </div>
            {mensaje && <p id="mensaje-exito-actualizar" className="actualizar-datos__mensaje-exito">{mensaje}</p>}
            {globalError && <p id="mensaje-error-actualizar" className="actualizar-datos__mensaje-error">{globalError}</p>}
            <button className="actualizar-datos__boton" type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar cambios'}</button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ActualizarDatos; 