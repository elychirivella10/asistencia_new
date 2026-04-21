"use server";

import { getShifts, getShiftById } from "../services/shift-read.service";

export async function loadShifts() {
  try {
    return await getShifts();
  } catch (error) {
    console.error("Error al cargar turnos:", error);
    return [];
  }
}

export async function getShift(id) {
  try {
    return await getShiftById(id);
  } catch (error) {
    console.error("Error al cargar turno:", error);
    return null;
  }
}
