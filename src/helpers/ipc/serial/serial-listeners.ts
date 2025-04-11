import { BrowserWindow, ipcMain } from "electron";
import {
  SERIAL_CLOSED,
  SERIAL_CONNECT,
  SERIAL_DISCONNECT,
  SERIAL_ERROR,
  SERIAL_GET,
  SERIAL_RECEIVE,
  SERIAL_SEND
} from "./serial-channels";
import { closeSerialPort, listSerialPorts, openSerialPort, sendSerialData } from "../../serial_helpers";

export function addSERIALEventListeners() {
  ipcMain.handle(SERIAL_CONNECT, async (event, { com }) => openSerialPort(com));
  ipcMain.handle(SERIAL_DISCONNECT, async () => closeSerialPort());
  ipcMain.handle(SERIAL_SEND, async (event, data) => sendSerialData(data));
  ipcMain.handle(SERIAL_GET, async () => listSerialPorts());
}


