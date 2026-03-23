"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { getNovedadesReport } from "../services/novedades-read.service";
import { novedadesFilterSchema } from "../schemas/report-filter.schema";
import { REPORT_CONFIG } from "../config/report.constants";

/**
 * Server Action: Fetches Novedades report data with specific filters.
 */
export const getNovedadesReportAction = createProtectedFunction(
  REPORT_CONFIG.PERMISSIONS.READ,
  async (filters) => {
    // 1. Zod runtime validation of incoming payload
    const parsedFilters = novedadesFilterSchema.parse(filters);
    
    // 2. Safe logic execution
    const data = await getNovedadesReport(parsedFilters);
    return { success: true, data };
  }
);
