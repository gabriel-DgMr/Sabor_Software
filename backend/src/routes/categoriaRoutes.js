import express from "express";
import { categoriaController } from "../controllers/categoriaController.js";

const router = express.Router();

// Rutas públicas
router.get("/", categoriaController.getAllCategorias);
router.get("/:id", categoriaController.getCategoriaById);
router.get(
  "/:categoriaId/productos",
  categoriaController.getProductosByCategoria,
);

// Nota: Las rutas para crear, actualizar y eliminar categorías
// se implementarán cuando se agreguen los métodos correspondientes
// al categoriaController y categoriaModel

export default router;
