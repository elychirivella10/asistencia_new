'use server';

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { getAttendanceReport } from "../services/report-read.service";
import { attendanceFilterSchema } from "../schemas/report-filter.schema";
import { REPORT_CONFIG } from "../config/report.constants";

/**
 * Server Action: Fetches attendance report data with specific filters.
 */
export const getAttendanceReportAction = createProtectedFunction(
  REPORT_CONFIG.PERMISSIONS.READ,
  async (filters) => {
    // 1. Zod runtime validation of incoming payload
    const parsedFilters = attendanceFilterSchema.parse(filters);
    
    // 2. Safe logic execution
    const data = await getAttendanceReport(parsedFilters);
    return { success: true, data };
  }
);
