import * as queries from "./queries.js";

export const getAllBanners = async (admin = false) => {
  return await queries.getAllBannersQuery(admin);
};

export const getBannerById = async (id) => {
  const banner = await queries.getBannerByIdQuery(id);
  if (!banner) {
    throw new Error("Banner no encontrado");
  }
  return banner;
};

export const createBanner = async (data) => {
  if (!data.imagen_url || !data.titulo) {
    throw new Error("Faltan campos obligatorios: imagen_url y titulo");
  }
  const id = await queries.createBannerQuery(data);
  return { id, ...data };
};

export const updateBanner = async (id, data) => {
  const banner = await queries.getBannerByIdQuery(id);
  if (!banner) {
    throw new Error("Banner no encontrado");
  }
  await queries.updateBannerQuery(id, data);
  return { id, ...data };
};

export const deleteBanner = async (id) => {
  const banner = await queries.getBannerByIdQuery(id);
  if (!banner) {
    throw new Error("Banner no encontrado");
  }
  await queries.deleteBannerQuery(id);
  return { message: "Banner eliminado exitosamente" };
};
