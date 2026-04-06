export const ANIM_DURATION = 500; // Duración de la animación de entrada/salida en ms
export const VISIBLE_DURATION = 3000; // Tiempo que un mensaje permanece visible antes de iniciar el fade-out en ms

/**
 * Añade una clase de animación a todos los elementos que coincidan con el selector.
 * @param {string} selector – Selector CSS de los elementos a animar.
 * @param {string} clase – Nombre de la clase de animación (p.ej. 'fade-in' o 'fade-out').
 */
export const animateElements = (selector, clase) => {
  document.querySelectorAll(selector).forEach(el => el.classList.add(clase));
};

/**
 * Añade una clase de animación a un único elemento que coincida con el selector.
 * Si se encuentran múltiples elementos, solo anima el primero.
 * @param {string} selector – Selector CSS del elemento a animar.
 * @param {string} clase – Nombre de la clase de animación (p.ej. 'fade-in' o 'fade-out').
 */
export const animateElement = (selector, clase) => {
  const element = document.querySelector(selector);
  if (element) {
    element.classList.add(clase);
  }
};
