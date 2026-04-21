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
  async (filters, session) => {
    // 1. Zod runtime validation of incoming payload
    const parsedFilters = novedadesFilterSchema.parse(filters);
    
    // 2. Safe logic execution — session passed to enforce area scope
    const data = await getNovedadesReport(parsedFilters, session);
    return { success: true, data };
  }
);
