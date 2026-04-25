import { exec } from "child_process";
import path from "path";
import prisma from "@/features/shared/lib/prisma";

/**
 * Executes a management command on the biometric device via Python.
 */
async function runDeviceCommand(action, biometricId, fingerIndex = null) {
  return new Promise((resolve, reject) => {
    const pythonPath = "python"; // Assume python is in PATH
    const managerPath = path.join(process.cwd(), "scripts", "manager.py");
    
    let cmd = `${pythonPath} "${managerPath}" manage-device --action ${action}`;
    if (biometricId) cmd += ` --id ${biometricId}`;
    if (fingerIndex !== null) cmd += ` --finger ${fingerIndex}`;

    console.log(`[BIOMETRIC_CMD] Executing: ${cmd}`);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`[BIOMETRIC_ERROR]: ${stderr}`);
        return resolve({ success: false, error: stderr || stdout || error.message });
      }
      console.log(`[BIOMETRIC_OUTPUT]: ${stdout}`);
      resolve({ success: true, output: stdout });
    });
  });
}

/**
 * Gets all saved fingerprints for a user from DB.
 */
export async function getUserFingerprints(userId) {
  try {
    const fingerprints = await prisma.huellas_biometricas.findMany({
      where: { usuario_id: userId },
      include: { cat_dedos: true },
      orderBy: { finger_index: 'asc' }
    });
    return { success: true, data: fingerprints };
  } catch (error) {
    console.error("Error fetching fingerprints:", error);
    return { success: false, error: "Error al consultar las huellas." };
  }
}

/**
 * Gets all available fingers from catalog.
 */
export async function getFingerCatalog() {
  try {
    const catalog = await prisma.cat_dedos.findMany({
      orderBy: { id: 'asc' }
    });
    return { success: true, data: catalog };
  } catch (error) {
    console.error("Error fetching finger catalog:", error);
    return { success: false, error: "Error al consultar el catálogo de dedos." };
  }
}

export async function pushUserToDevice(biometricId) {
  return await runDeviceCommand("push-user", biometricId);
}

/**
 * Business logic to delete a user completely from the device.
 */
export async function deleteUserFromDevice(biometricId) {
  return await runDeviceCommand("delete-user", biometricId);
}

/**
 * Business logic to delete a fingerprint from device and DB.
 */
export async function deleteFingerprint(biometricId, fingerIndex) {
  return await runDeviceCommand("delete-finger", biometricId, fingerIndex);
}

/**
 * Business logic to sync all templates from device to DB.
 */
export async function syncAllTemplates() {
  return await runDeviceCommand("sync-templates");
}

/**
 * Business logic to push all users from DB to the device.
 */
export async function pushAllUsersToDevice() {
  return await runDeviceCommand("push-all-users");
}

/**
 * Business logic to run a full bidirectional sync.
 */
export async function runTotalSync() {
  return await runDeviceCommand("total-sync");
}
