import {
  WIN_MINIMIZE_CHANNEL,
  WIN_MAXIMIZE_CHANNEL,
  WIN_CLOSE_CHANNEL,
  WIN_DIALOG_INFO,
  WIN_SELECT_DIRECTORY,
} from "./window-channels";

export function exposeWindowContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("electronWindow", {
    minimize: () => ipcRenderer.invoke(WIN_MINIMIZE_CHANNEL),
    maximize: () => ipcRenderer.invoke(WIN_MAXIMIZE_CHANNEL),
    close: () => ipcRenderer.invoke(WIN_CLOSE_CHANNEL),
    info: (title: any, message: any) => ipcRenderer.invoke(WIN_DIALOG_INFO, { title, message }),
    selectDirectory: (title: string, message: string) => ipcRenderer.invoke(WIN_SELECT_DIRECTORY, { title, message }),
  });
}
