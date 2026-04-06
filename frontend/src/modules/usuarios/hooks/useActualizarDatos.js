import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../app/context/AuthContext.jsx';
import {
  ANIM_DURATION,
  VISIBLE_DURATION,
  animateElements,
} from '../../../shared/utils/animationUtils.js';
import {
  validarEmail,
  validarTelefono,
  validarLongitud,
  validarCaracteresEspeciales,
  validarEspacios,
} from '../../../shared/utils/validaciones.js';
import { getImageUrl } from '../../../shared/utils/imageUtils.js';
import { useTranslation } from 'react-i18next';
import { usuariosService } from '../services/usuarios-service';

export const useActualizarDatos = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [cargando, setCargando] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = t('actualizar_perfil.document_title');
    if (user) {
      setNombre(user.nombre_usuario || '');
      setCorreo(user.correo_usuario || '');
      setTelefono(user.telefono_usuario || '');
      if (user.imagen_usuario) {
        setImagenPreview(getImageUrl(user.imagen_usuario));
      }
    }
  }, [user]);

  // El manejo de errores ahora es persistente hasta que el usuario corrija el campo.

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setGlobalError(t('actualizar_perfil.error_tipo_archivo'));
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setGlobalError(t('actualizar_perfil.error_tamano_archivo'));
        return;
      }

      setImagenPerfil(file);

      const reader = new FileReader();
      reader.onload = e => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagenPerfil(null);
    setImagenPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setGlobalError('');
    setErrors({});

    const newErrors = {};

    if (!nombre) {
      newErrors.nombre = t('actualizar_perfil.nombre_obligatorio');
    } else {
      const longitudError = validarLongitud(nombre, 'nombre', 2, 50);
      if (longitudError) {
        newErrors.nombre = longitudError;
      } else {
        const caracteresError = validarCaracteresEspeciales(nombre, 'nombre');
        if (caracteresError) {
          newErrors.nombre = caracteresError;
        } else {
          const espaciosError = validarEspacios(nombre, 'nombre');
          if (espaciosError) {
            newErrors.nombre = espaciosError;
          }
        }
      }
    }

    if (!correo) {
      newErrors.correo = t('actualizar_perfil.correo_obligatorio');
    } else {
      const emailError = validarEmail(correo);
      if (emailError) {
        newErrors.correo = emailError;
      } else {
        const espaciosError = validarEspacios(correo, 'correo');
        if (espaciosError) {
          newErrors.correo = espaciosError;
        }
      }
    }

    if (!telefono) {
      newErrors.telefono = t('actualizar_perfil.telefono_obligatorio');
    } else {
      const telefonoError = validarTelefono(telefono);
      if (telefonoError) {
        newErrors.telefono = telefonoError;
      } else {
        const espaciosError = validarEspacios(telefono, 'teléfono');
        if (espaciosError) {
          newErrors.telefono = espaciosError;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nombre_usuario', nombre.trim());
      formData.append('correo_usuario', correo.trim());
      formData.append('telefono_usuario', telefono.trim());

      if (imagenPerfil) {
        formData.append('imagen_usuario', imagenPerfil);
      }

      const responseData = await usuariosService.actualizarPerfil(user.id_usuario, formData);

      setMensaje(t('actualizar_perfil.exito'));
    } catch (error) {
      setGlobalError(error.message || t('actualizar_perfil.error_generico'));
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (name, value) => {
    if (name === 'nombre') setNombre(value);
    if (name === 'correo') setCorreo(value);
    if (name === 'telefono') setTelefono(value);

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Limpiar errores globales al interactuar
    if (globalError) setGlobalError('');
    if (mensaje) setMensaje('');
  };

  return {
    nombre,
    setNombre,
    correo,
    setCorreo,
    telefono,
    setTelefono,
    handleInputChange,
    imagenPreview,
    mensaje,
    errors,
    globalError,
    cargando,
    fileInputRef,
    handleImageChange,
    removeImage,
    handleSubmit,
  };
};
