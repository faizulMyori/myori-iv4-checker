import { BrowserWindow, ipcMain, dialog, shell, app } from "electron";
import {
  WIN_CLOSE_CHANNEL,
  WIN_DIALOG_INFO,
  WIN_MAXIMIZE_CHANNEL,
  WIN_MINIMIZE_CHANNEL,
  WIN_SELECT_DIRECTORY,
  WINDOW_CHECK_FILE_EXISTS,
  WINDOW_OPEN_FILE_LOCATION,
  WINDOW_MINIMIZE,
  WINDOW_MAXIMIZE,
  WINDOW_CLOSE,
  WINDOW_INFO,
  WINDOW_SELECT_DIRECTORY,
  WIN_TOAST,
  APP_RELOAD
} from "./window-channels";
import fs from 'fs';
import path from 'path';

export function addWindowEventListeners(mainWindow: BrowserWindow) {
  // Handle win: prefixed channels
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

  // Handle window: prefixed channels
  ipcMain.handle(WINDOW_MINIMIZE, () => {
    mainWindow.minimize();
  });
  ipcMain.handle(WINDOW_MAXIMIZE, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.handle(WINDOW_CLOSE, () => {
    mainWindow.close();
  });

  // Handle info dialogs for both prefixes
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

  ipcMain.handle(WINDOW_INFO, async (event, data) => {
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

  // Handle directory selection for both prefixes
  ipcMain.handle(WIN_SELECT_DIRECTORY, async (event, data) => {
    if (mainWindow) {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: data.title,
        message: data.message,
        properties: ['openDirectory']
      });
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    }
    return null;
  });

  ipcMain.handle(WINDOW_SELECT_DIRECTORY, async (event, data) => {
    if (mainWindow) {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: data.title,
        message: data.message,
        properties: ['openDirectory']
      });
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    }
    return null;
  });

  ipcMain.handle(WINDOW_CHECK_FILE_EXISTS, async (event, filePath) => {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle(WINDOW_OPEN_FILE_LOCATION, async (event, filePath) => {
    try {
      const dirPath = path.dirname(filePath);
      await shell.openPath(dirPath);
    } catch (error) {
      console.error('Error opening file location:', error);
      throw error;
    }
  });

  // Handle toast notifications
  ipcMain.on('win-toast', (_, { title, description, type }) => {
    console.log('Main process received toast:', { title, description, type });
    if (mainWindow) {
      console.log('Sending toast to renderer process');
      mainWindow.webContents.send('win-toast', { title, description, type });
    } else {
      console.error('Main window not available for sending toast');
    }
  });

  // Handle app reload after license activation
  ipcMain.on(APP_RELOAD, () => {
    console.log('Reloading application after license activation');
    app.relaunch();
    app.exit(0);
  });
}
