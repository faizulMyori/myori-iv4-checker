import { app, BrowserWindow, dialog } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import {
  initializeDatabase,
} from "./helpers/db_helpers";
import { closeSerialPort } from "./helpers/serial_helpers";


const logFilePath = path.join(app.getPath('userData'), 'logs', 'app.log');
console.log('Log file path:', logFilePath); // visible in terminal

const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    maximizable: true,
    //fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
    titleBarStyle: "hidden",
  });
  registerListeners(mainWindow);

  mainWindow.on("close", async (event) => {
    event.preventDefault();

    const response = await dialog.showMessageBox(mainWindow, {
      type: "question",
      buttons: ["Cancel", "Exit"],
      defaultId: 1,
      cancelId: 0,
      title: "Confirm Exit",
      message: "Sure to exit?"
    })

    if (response.response === 1) {
      try {
        const result = await closeSerialPort();
        console.log(result)
      } catch (err) {
        console.log(err)
      } finally {
        mainWindow.removeAllListeners("close")
        mainWindow.close()
        app.quit()
      }
      
    }
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

app.whenReady()
  .then(createWindow)
  .then(installExtensions)
  .then(initializeDatabase);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});