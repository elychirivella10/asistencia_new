'use server'

import { createProtectedFunction } from "@/lib/safe-action";
import { searchUsers as searchUsersService } from '../services/user-read.service'
import { USER_CONFIG } from "../config/user.constants";

/**
 * Searches users by name, surname or ID card.
 * @param {string} query - Search term.
 * @returns {Promise<Array>} List of users (id, nombre, apellido, cedula).
 */
export const searchUsers = createProtectedFunction(USER_CONFIG.PERMISSIONS.READ, async (query, session) => {
  return await searchUsersService(query, session)
});
