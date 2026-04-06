import * as S from "./services.js";
import fs from "fs/promises";

export const getAllBanners = async (req, res) => {
  try {
    const admin = req.query.admin === "true";
    const banners = await S.getAllBanners(admin);
    res.json(banners);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener banners", error: error.message });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const banner = await S.getBannerById(req.params.id);
    res.json(banner);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const {
      titulo,
      titulo_en,
      descripcion,
      descripcion_en,
      boton_texto,
      boton_texto_en,
      boton_enlace,
      posicion_contenido,
      orden,
      activo,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "La imagen es obligatoria" });
    }

    const bannerData = {
      titulo,
      titulo_en,
      descripcion,
      descripcion_en,
      boton_texto,
      boton_texto_en,
      boton_enlace,
      posicion_contenido: posicion_contenido || "centro-centro",
      orden: orden ? parseInt(orden) : 0,
      activo:
        activo !== undefined
          ? activo === "true" || activo === true
            ? 1
            : 0
          : 1,
      imagen_url: req.file.filename,
    };

    const nuevoBanner = await S.createBanner(bannerData);
    res
      .status(201)
      .json({ message: "Banner creado exitosamente", banner: nuevoBanner });
  } catch (error) {
    console.error("DEBUG - Error en createBanner:", error);
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({
      message: "Error al crear banner",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const {
      titulo,
      titulo_en,
      descripcion,
      descripcion_en,
      boton_texto,
      boton_texto_en,
      boton_enlace,
      posicion_contenido,
      orden,
      activo,
    } = req.body;
    const bannerData = {
      titulo,
      titulo_en,
      descripcion,
      descripcion_en,
      boton_texto,
      boton_texto_en,
      boton_enlace,
      posicion_contenido,
      orden: orden !== undefined ? parseInt(orden) : undefined,
      activo:
        activo !== undefined
          ? activo === "true" || activo === true
            ? 1
            : 0
          : undefined,
    };

    if (req.file) {
      bannerData.imagen_url = req.file.filename;
    }

    const bannerActualizado = await S.updateBanner(req.params.id, bannerData);
    res.json({
      message: "Banner actualizado exitosamente",
      banner: bannerActualizado,
    });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (e) {}
    }
    res
      .status(500)
      .json({ message: "Error al actualizar banner", error: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const result = await S.deleteBanner(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
