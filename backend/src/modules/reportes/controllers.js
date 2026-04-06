import { reportesService } from "./services.js";

/**
 * @description Obtiene las métricas generales del dashboard (usuarios, visitas, pedidos).
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getMetrics = async (req, res) => {
  try {
    const data = await reportesService.getMetrics();
    res.json(data);
  } catch (err) {
    console.error("Error en getMetrics:", err);
    res.status(500).json({ error: "Error obteniendo métricas generales" });
  }
};

/**
 * @description Obtiene las métricas de ventas.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getSalesMetrics = async (req, res) => {
  try {
    const data = await reportesService.getSalesMetrics();
    res.json(data);
  } catch (err) {
    console.error("Error en getSalesMetrics:", err);
    res.status(500).json({ error: "Error obteniendo métricas de ventas" });
  }
};

/**
 * @description Obtiene las métricas de empleados.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getEmployeeMetrics = async (req, res) => {
  try {
    const data = await reportesService.getEmployeeMetrics();
    res.json(data);
  } catch (err) {
    console.error("Error en getEmployeeMetrics:", err);
    res.status(500).json({ error: "Error obteniendo métricas de empleados" });
  }
};

/**
 * @description Obtiene las métricas y estado del inventario.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getInventoryMetrics = async (req, res) => {
  try {
    const data = await reportesService.getInventoryMetrics();
    res.json(data);
  } catch (err) {
    console.error("Error en getInventoryMetrics:", err);
    res.status(500).json({ error: "Error obteniendo métricas de inventario" });
  }
};
