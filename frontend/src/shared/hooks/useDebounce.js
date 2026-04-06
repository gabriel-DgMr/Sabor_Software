import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce
 * @param {any} value - El valor a debounce
 * @param {number} delay - El delay en milisegundos
 * @returns {any} - El valor debounced
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
