import { ipcMain } from "electron";
import {
  LICENSE_GET_MACHINE_ID,
  LICENSE_VALIDATE_KEY,
  LICENSE_SAVE_VALIDATION,
  LICENSE_CHECK_MACHINE
} from "./license-channels";
import {
  getMachineId,
  validateLicenseKey,
  saveLicenseValidation,
  checkMachineLicense
} from "../../license_helpers";

export function addLicenseEventListeners() {
  // Get the machine ID
  ipcMain.handle(LICENSE_GET_MACHINE_ID, async () => {
    try {
      return getMachineId();
    } catch (error) {
      console.error("Error getting machine ID:", error);
      throw error;
    }
  });

  // Validate a license key
  ipcMain.handle(LICENSE_VALIDATE_KEY, async (_, licenseKey) => {
    try {
      return validateLicenseKey(licenseKey);
    } catch (error) {
      console.error("Error validating license key:", error);
      throw error;
    }
  });

  // Save license validation result
  ipcMain.handle(LICENSE_SAVE_VALIDATION, async (_, licenseKey, isValid, expiryDate) => {
    try {
      saveLicenseValidation(licenseKey, isValid, expiryDate ? new Date(expiryDate) : undefined);
      return true;
    } catch (error) {
      console.error("Error saving license validation:", error);
      throw error;
    }
  });

  // Check if the machine has a valid license
  ipcMain.handle(LICENSE_CHECK_MACHINE, async () => {
    try {
      return checkMachineLicense();
    } catch (error) {
      console.error("Error checking machine license:", error);
      throw error;
    }
  });
}