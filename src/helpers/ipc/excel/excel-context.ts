import {
  EXCEL_SAVE
} from "./excel-channels";

export function exposeExcelContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("excel", {
    save_to_excel: (data: any, filePath?: string) => ipcRenderer.invoke(EXCEL_SAVE, { data, filePath }),
  });
}
