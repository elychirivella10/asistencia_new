import prisma from "@/features/shared/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { attendanceFilterSchema } from "../schemas/attendance.schema";
import { ATTENDANCE_RECORD_SELECT } from "../config/attendance-record.select";
import { buildAttendanceWhere } from "./attendance-where.service";
import { buildAttendanceOrderBy } from "./attendance-orderby.service";
import { getAttendanceStats } from "./attendance-stats.service";

export async function getAttendanceRecords({
  from,
  to,
  areaId,
  searchTerm,
  status,
  llegada,
  salida,
  excepcion,
  sortKey,
  sortDirection,
  page,
  pageSize,
  currentUser,
} = {}) {
  const fromDate = from ? (typeof from === "string" ? new Date(from) : from) : startOfMonth(new Date());
  const toDate = to ? (typeof to === "string" ? new Date(to) : to) : endOfMonth(new Date());

  const validation = attendanceFilterSchema.safeParse({
    from: fromDate, to: toDate, areaId, searchTerm, status, llegada, salida, excepcion,
  });

  if (!validation.success) {
    return { records: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 1, stats: null };
  }

  const safePageSize = Number.isFinite(Number(pageSize)) ? Math.max(1, Math.min(200, Number(pageSize))) : 10;
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;

  try {
    const where = await buildAttendanceWhere({
      fromDate,
      toDate,
      areaId,
      searchTerm,
      status,
      llegada,
      salida,
      excepcion,
      currentUser,
    });

    const orderBy = buildAttendanceOrderBy(sortKey, sortDirection);
    const skip = (safePage - 1) * safePageSize;

    const [totalCount, records, statsBase] = await Promise.all([
      prisma.resumen_diario.count({ where }),
      prisma.resumen_diario.findMany({ where, orderBy, skip, take: safePageSize, select: ATTENDANCE_RECORD_SELECT }),
      getAttendanceStats(where),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
    const boundedPage = Math.min(safePage, totalPages);

    const formattedRecords = records.map(record => ({
      ...record,
      usuario: record.usuarios,
    }));

    return {
      records: formattedRecords,
      totalCount,
      page: boundedPage,
      pageSize: safePageSize,
      totalPages,
      stats: statsBase ? { ...statsBase, totalRecords: totalCount } : null,
    };
  } catch (error) {
    if (error?.message && error.message.includes("Access Denied")) throw error;
    throw new Error("Error al cargar registros de asistencia.");
  }
}
