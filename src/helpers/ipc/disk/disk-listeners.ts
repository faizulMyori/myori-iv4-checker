import { ipcMain } from "electron";
import {
  DISK_CHECK_SPACE,
  DISK_GET
} from "./disk-channels";
import { WIN_DIALOG_INFO } from "../window/window-channels";
import { fetchOne } from "sqlite-electron";
const checkDiskSpace = require('check-disk-space').default

export function addDiskEventListeners() {
  ipcMain.handle(DISK_GET, (event, path) => {
    return new Promise((resolve, reject) => {
      checkDiskSpace(path).then((result: any) => {
        resolve(result);
      }).catch((error: any) => {
        reject(error);
      })
    });
  });

  ipcMain.handle(DISK_CHECK_SPACE, async (event, path) => {
    try {
      const result = await checkDiskSpace(path);
      let data: any = await fetchOne("SELECT * FROM storage_treshold ORDER BY id DESC LIMIT 1");
      
      let threshold = 80/100
      if (data) {
        threshold = parseInt(data.treshold) / 100
      }

      if ((result.size - result.free) / result.size >= threshold) {
        ipcMain.emit(WIN_DIALOG_INFO, {
          title: "Disk Full",
          message: `Disk ${path} is 80% full. Please free up space.`,
        });
      }

      return result; // Ensure the function returns the disk space info
    } catch (error) {
      console.error("Error checking disk space:", error);
      throw error; // Propagate the error to be handled in the renderer process
    }
  });
}
