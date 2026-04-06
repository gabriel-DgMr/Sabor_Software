import { dbConfig } from "../../core/config/dbconfig.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool(dbConfig);

export const getAllBannersQuery = async (admin = false) => {
  let sql = "SELECT * FROM banners ";
  if (!admin) {
    sql += " WHERE activo = 1 ";
  }
  sql += " ORDER BY orden ASC, fecha_creacion DESC ";

  const [rows] = await pool.query(sql);
  return rows;
};

export const getBannerByIdQuery = async (id) => {
  const [rows] = await pool.query("SELECT * FROM banners WHERE id_banner = ?", [
    id,
  ]);
  return rows[0] || null;
};

export const createBannerQuery = async (data) => {
  const [result] = await pool.query(
    "INSERT INTO banners (imagen_url, titulo, titulo_en, descripcion, descripcion_en, boton_texto, boton_texto_en, boton_enlace, posicion_contenido, orden, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.imagen_url,
      data.titulo,
      data.titulo_en,
      data.descripcion,
      data.descripcion_en,
      data.boton_texto,
      data.boton_texto_en,
      data.boton_enlace,
      data.posicion_contenido || "centro-centro",
      data.orden || 0,
      data.activo !== undefined ? data.activo : 1,
    ],
  );
  return result.insertId;
};

export const updateBannerQuery = async (id, data) => {
  const fields = [];
  const params = [];

  const allowedFields = {
    imagen_url: data.imagen_url,
    titulo: data.titulo,
    titulo_en: data.titulo_en,
    descripcion: data.descripcion,
    descripcion_en: data.descripcion_en,
    boton_texto: data.boton_texto,
    boton_texto_en: data.boton_texto_en,
    boton_enlace: data.boton_enlace,
    posicion_contenido: data.posicion_contenido,
    orden: data.orden,
    activo: data.activo,
  };

  for (const [key, value] of Object.entries(allowedFields)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (fields.length === 0) return true;

  const sql = `UPDATE banners SET ${fields.join(", ")} WHERE id_banner = ?`;
  params.push(id);

  const [result] = await pool.query(sql, params);
  return result.affectedRows > 0;
};

export const deleteBannerQuery = async (id) => {
  const [result] = await pool.query("DELETE FROM banners WHERE id_banner = ?", [
    id,
  ]);
  return result.affectedRows > 0;
};
