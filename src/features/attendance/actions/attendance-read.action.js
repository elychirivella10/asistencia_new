"use server";

import { getAttendanceRecordById } from "../services/attendance-read.service";

/**
 * Server Action to retrieve a single attendance record by its ID.
 * @param {string} id - The UUID of the attendance record.
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getAttendanceRecordByIdAction = async (id) => {
  if (!id) {
    return { success: false, data: null, error: "ID is required." };
  }

  try {
    const record = await getAttendanceRecordById(id);
    if (!record) {
      return { success: false, data: null, error: "Record not found." };
    }
    return { success: true, data: record, error: null };
  } catch (error) {
    console.error(`Failed to fetch attendance record ${id}:`, error);
    return { success: false, data: null, error: "Failed to fetch record details." };
  }
};