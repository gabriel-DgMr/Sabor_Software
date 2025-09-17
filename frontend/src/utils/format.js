export function FormatPriceCOP(precio) {
  const num = typeof precio === 'number' ? precio : Number(precio);
  if (isNaN(num)) return '';
  return num.toLocaleString('es-CO');
}
