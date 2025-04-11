import {
  TCP_CONNECT,
  TCP_CLOSED,
  TCP_DISCONNECT,
  TCP_ERROR,
  TCP_RECEIVE,
  TCP_SEND,
  TCP_CONNECTED,
  TCP_SET_AUTO_RECONNECT
} from "./tcp-channels";

export function exposeTCPContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");

  contextBridge.exposeInMainWorld("tcpConnection", {
    tcp_connect: (connectionDetails: any) => ipcRenderer.invoke(TCP_CONNECT, connectionDetails),

    tcp_received: (callback: any) => {
      ipcRenderer.removeAllListeners(TCP_RECEIVE); // Remove existing listener
      ipcRenderer.on(TCP_RECEIVE, (_: any, data: any) => callback(data));
    },

    tcp_closed: (callback: any) => {
      ipcRenderer.removeAllListeners(TCP_CLOSED);
      ipcRenderer.on(TCP_CLOSED, callback);
    },

    tcp_disconnect: () => ipcRenderer.invoke(TCP_DISCONNECT),

    tcp_connected: (callback: any) => {
      ipcRenderer.removeAllListeners(TCP_CONNECTED);
      ipcRenderer.on(TCP_CONNECTED, callback);
    },

    tcp_send: (data: any) => ipcRenderer.invoke(TCP_SEND, data),

    set_auto_reconnect: (enabled: boolean) => ipcRenderer.invoke(TCP_SET_AUTO_RECONNECT, enabled),
  });
}
