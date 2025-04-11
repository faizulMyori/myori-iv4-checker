import { app, BrowserWindow, ipcMain, dialog } from "electron";
import {
    EXCEL_SAVE
} from "./excel-channels";
import path from "path";
import { saveToExcel } from "../../excel_helpers";

export function addExcelEventListeners(mainWindow: BrowserWindow) {
    ipcMain.handle(EXCEL_SAVE, async (event, { data, filePath }) => {
        if (!data || data.length === 0) {
            throw new Error('No data to save');
        }

        for (const items of data) {
            let finalFilePath = filePath;

            // If no file path is provided, show the save dialog
            if (!finalFilePath) {
                const { canceled, filePath: dialogPath } = await dialog.showSaveDialog(mainWindow, {
                    title: `Save ${items.title} Excel File`,
                    defaultPath: path.join(app.getPath('documents'), new Date().toISOString().slice(0, 10) + '-' + items.title + '.xlsx'),
                    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
                });

                if (canceled || !dialogPath) return; // If canceled or no file path, skip saving
                finalFilePath = dialogPath;
            }

            // Save the file
            await saveToExcel(finalFilePath, [...[items.metadata], ...items.data], items.title);
        }
    });
}




