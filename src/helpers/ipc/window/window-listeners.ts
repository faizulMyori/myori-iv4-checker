import { BrowserWindow, ipcMain, dialog } from "electron";
import {
  WIN_CLOSE_CHANNEL,
  WIN_DIALOG_INFO,
  WIN_MAXIMIZE_CHANNEL,
  WIN_MINIMIZE_CHANNEL,
} from "./window-channels";

export function addWindowEventListeners(mainWindow: BrowserWindow) {
  ipcMain.handle(WIN_MINIMIZE_CHANNEL, () => {
    mainWindow.minimize();
  });
  ipcMain.handle(WIN_MAXIMIZE_CHANNEL, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.handle(WIN_CLOSE_CHANNEL, () => {
    mainWindow.close();
  });

  ipcMain.handle(WIN_DIALOG_INFO, async (event, data) => {
    console.log(data)
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: data.title,
        message: data.message,
        buttons: ['OK']
      });
    }
  });

  ipcMain.on(WIN_DIALOG_INFO, async (data: any) => {
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: data.title,
        message: data.message,
        buttons: ['OK']
      });
    }
  });
}
