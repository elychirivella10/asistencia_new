"use server";

import { revalidatePath } from "next/cache";
import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { USER_CONFIG } from "../config/user.constants";
import * as biometricService from "../services/user-biometric.service";
import { ROUTES } from "@/features/shared/config/routes";

/**
 * Action to get a user's fingerprints.
 */
export const getUserFingerprintsAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.READ,
  async (userId) => {
    return await biometricService.getUserFingerprints(userId);
  }
);

/**
 * Action to get the finger catalog.
 */
export const getFingerCatalogAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.READ,
  async () => {
    return await biometricService.getFingerCatalog();
  }
);

/**
 * Action to push a user to the biometric device.
 */
export const pushUserToClockAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.MANAGE_BIOMETRICS,
  async (biometricId) => {
    const result = await biometricService.pushUserToDevice(biometricId);
    if (result.success) {
      revalidatePath(ROUTES.ADMIN.USUARIOS.path);
    }
    return result;
  }
);

/**
 * Action to delete a fingerprint.
 */
export const deleteFingerprintAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.MANAGE_BIOMETRICS,
  async (biometricId, fingerIndex, userId) => {
    const result = await biometricService.deleteFingerprint(biometricId, fingerIndex);
    if (result.success) {
      revalidatePath(ROUTES.ADMIN.USUARIOS.path);
    }
    return result;
  }
);

/**
 * Sync templates for a specific user from clock to DB.
 */
export const syncUserTemplatesFromClockAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.MANAGE_BIOMETRICS,
  async (biometricId, userId) => {
    const result = await biometricService.syncAllTemplates();
    if (result.success) {
      revalidatePath(ROUTES.ADMIN.USUARIOS.path);
      return await biometricService.getUserFingerprints(userId);
    }
    return result;
  }
);

/**
 * Global sync of templates (Reloj -> Web).
 */
export const syncAllClockTemplatesAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.MANAGE_BIOMETRICS,
  async () => {
    const result = await biometricService.syncAllTemplates();
    if (result.success) {
      revalidatePath(ROUTES.ADMIN.USUARIOS.path);
    }
    return result;
  }
);

/**
 * Global sync of users (Web -> Reloj).
 */
export const pushAllUsersToClockAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.MANAGE_BIOMETRICS,
  async () => {
    const result = await biometricService.pushAllUsersToDevice();
    return result;
  }
);

/**
 * Full bidirectional sync (Web <-> Reloj).
 */
export const runTotalSyncAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.MANAGE_BIOMETRICS,
  async () => {
    const result = await biometricService.runTotalSync();
    if (result.success) {
      revalidatePath(ROUTES.ADMIN.USUARIOS.path);
    }
    return result;
  }
);
