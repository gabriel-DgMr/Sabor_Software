export function FormatPriceCOP(precio) {
  if (typeof precio !== "number") return "";
  return precio.toLocaleString('es-CO');
}
