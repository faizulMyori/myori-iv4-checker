import {
  WINDOW_MINIMIZE,
  WINDOW_MAXIMIZE,
  WINDOW_CLOSE,
  WINDOW_INFO,
  WINDOW_SELECT_DIRECTORY,
  WINDOW_CHECK_FILE_EXISTS,
  WINDOW_OPEN_FILE_LOCATION,
  WIN_TOAST,
  APP_RELOAD
} from "./window-channels";

export function exposeWindowContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");

  // Expose IPC renderer for toast notifications
  contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
      on: (channel: string, callback: (event: any, ...args: any[]) => void) => {
        console.log('Setting up IPC listener for channel:', channel);
        ipcRenderer.on(channel, callback);
      },
      send: (channel: string, ...args: any[]) => {
        ipcRenderer.send(channel, ...args);
      }
    }
  });

  contextBridge.exposeInMainWorld("electronWindow", {
    minimize: () => ipcRenderer.invoke(WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.invoke(WINDOW_MAXIMIZE),
    close: () => ipcRenderer.invoke(WINDOW_CLOSE),
    info: (title: string, message: string) => ipcRenderer.invoke(WINDOW_INFO, { title, message }),
    selectDirectory: (title: string, message: string) => ipcRenderer.invoke(WINDOW_SELECT_DIRECTORY, { title, message }),
    checkFileExists: (filePath: string) => ipcRenderer.invoke(WINDOW_CHECK_FILE_EXISTS, filePath),
    openFileLocation: (filePath: string) => ipcRenderer.invoke(WINDOW_OPEN_FILE_LOCATION, filePath),
  });
}
