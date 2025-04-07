import {
  EXCEL_SAVE
} from "./excel-channels";

export function exposeExcelContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("excel", {
    save_to_excel: (data: any) => ipcRenderer.invoke(EXCEL_SAVE, { data }),
  });
}
