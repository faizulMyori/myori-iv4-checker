import {
  DISK_GET,
  DISK_CHECK_SPACE
} from "./disk-channels";

export function exposeDiskContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("disk", {
    disk_get: (path:any) => ipcRenderer.invoke(DISK_GET, path),
    disk_check_space: (path:any) => ipcRenderer.invoke(DISK_CHECK_SPACE, path),
  });
}
