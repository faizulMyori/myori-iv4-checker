import {
  LICENSE_GET_MACHINE_ID,
  LICENSE_VALIDATE_KEY,
  LICENSE_SAVE_VALIDATION,
  LICENSE_CHECK_MACHINE
} from "./license-channels";

export function exposeLicenseContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("license", {
    getMachineId: () => ipcRenderer.invoke(LICENSE_GET_MACHINE_ID),
    validateLicenseKey: (licenseKey: string) => ipcRenderer.invoke(LICENSE_VALIDATE_KEY, licenseKey),
    saveLicenseValidation: (licenseKey: string, isValid: boolean, expiryDate?: Date) => 
      ipcRenderer.invoke(LICENSE_SAVE_VALIDATION, licenseKey, isValid, expiryDate),
    checkMachineLicense: () => ipcRenderer.invoke(LICENSE_CHECK_MACHINE),
  });
}