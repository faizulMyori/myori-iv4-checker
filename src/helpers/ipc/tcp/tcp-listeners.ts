import { BrowserWindow, ipcMain } from "electron";
import {
  TCP_CLOSED,
  TCP_CONNECT,
  TCP_DISCONNECT,
  TCP_ERROR,
  TCP_RECEIVE,
  TCP_SEND,
  TCP_START_RECEIVE
} from "./tcp-channels";
import { connectTcp, closeTcpConnection, requestOCRData } from "../../tcp_helpers";

export function addTCPEventListeners() {
  ipcMain.handle(TCP_CONNECT, async (event, { ip, port }) => connectTcp(ip, port, event));
  ipcMain.handle(TCP_DISCONNECT, async () => closeTcpConnection());
  ipcMain.handle(TCP_SEND, async (event) => requestOCRData(event));
  ipcMain.handle(TCP_START_RECEIVE, async (event, data) => {
    if (data) {
      requestOCRData(event);
    }
  })
}



