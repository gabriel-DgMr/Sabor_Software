import {
  getMetricsQuery,
  getSalesMetricsQuery,
  getEmployeeMetricsQuery,
  getInventoryMetricsQuery,
} from "./queries.js";

export const reportesService = {
  getMetrics: async () => await getMetricsQuery(),
  getSalesMetrics: async () => await getSalesMetricsQuery(),
  getEmployeeMetrics: async () => await getEmployeeMetricsQuery(),
  getInventoryMetrics: async () => await getInventoryMetricsQuery(),
};
