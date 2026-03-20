import { getVisibleAreas } from "@/features/areas/services/area-visibility.service";
import { getAttendanceStatusMap } from "./attendance-status.service";
import { getAttendanceRecords } from "./attendance-records.service";
import prisma from "@/features/shared/lib/prisma";

/**
 * Retrieves all data required for the Attendance Page.
 * @param {Object} currentUser - The current user session.
 * @param {Object} params - Search parameters (from, to, areaId, searchTerm, status).
 * @returns {Promise<{areas: Array, attendanceData: Array, statusMap: Object}>}
 */
export const getAttendancePageData = async (currentUser, params = {}) => {
  const { from, to, areaId, searchTerm, status, llegada, salida, excepcion, sortKey, sortDirection, page, pageSize } = params;

  try {
    const [areas, attendanceResult, statusMap] = await Promise.all([
      getVisibleAreas(currentUser),
      getAttendanceRecords({
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
        currentUser
      }),
      getAttendanceStatusMap(),
    ]);

    return {
      areas,
      attendanceData: attendanceResult.records,
      statusMap,
      stats: attendanceResult.stats,
      totalCount: attendanceResult.totalCount,
      page: attendanceResult.page,
      pageSize: attendanceResult.pageSize,
      totalPages: attendanceResult.totalPages,
    };
  } catch (error) {
    console.error("Error loading attendance page data:", error);
    throw error;
  }
};

/**
 * Retrieves a single attendance record by its ID with related data.
 * @param {string} id - The UUID of the attendance record.
 * @returns {Promise<Object|null>}
 */
export const getAttendanceRecordById = async (id) => {
  try {
    const record = await prisma.asistencia.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            cedula: true,
            email: true,
            area: { select: { nombre: true } },
          },
        },
        dispositivo: {
          select: {
            nombre: true,
            ip: true,
            ubicacion: true,
          },
        },
        estadoAsistencia: {
          select: {
            nombre: true,
            color_hex: true,
            categoria: true,
          },
        },
      },
    });

    return record;
  } catch (error) {
    console.error(`Error fetching attendance record by ID ${id}:`, error);
    throw new Error("Failed to retrieve attendance record from database.");
  }
};
