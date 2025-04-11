import {
  SERIAL_CONNECT,
  SERIAL_CLOSED,
  SERIAL_DISCONNECT,
  SERIAL_ERROR,
  SERIAL_RECEIVE,
  SERIAL_SEND,
  SERIAL_GET
} from "./serial-channels";

export function exposeSERIALContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("serial", {
    serial_com_open: (connectionDetails: any) => ipcRenderer.invoke(SERIAL_CONNECT, connectionDetails),
    serial_received: (callback: any) => ipcRenderer.on(SERIAL_RECEIVE, (_: any, data: any) => callback(data)),
    serial_com_close: (callback: any) => ipcRenderer.on(SERIAL_CLOSED, callback),
    serial_com_disconnect: () => ipcRenderer.invoke(SERIAL_DISCONNECT),
    serial_com_send: (data: any) => ipcRenderer.invoke(SERIAL_SEND, data),
    serial_com_get: () => ipcRenderer.invoke(SERIAL_GET),
  });
}
