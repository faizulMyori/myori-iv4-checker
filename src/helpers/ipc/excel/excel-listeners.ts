import { app, BrowserWindow, ipcMain, dialog } from "electron";
import {
    EXCEL_SAVE
} from "./excel-channels";
import path from "path";
import { saveToExcel } from "../../excel_helpers";

export function addExcelEventListeners(mainWindow: BrowserWindow) {
    ipcMain.handle(EXCEL_SAVE, async (event, { data }) => {
        if (!data || data.length === 0) {
            throw new Error('No data to save');
        }

        for (const items of data) {
            // Show the save dialog for each file
            const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
                title: `Save ${items.title} Excel File`,
                defaultPath: path.join(app.getPath('documents'), new Date().toISOString().slice(0, 10) + '-' + items.title + '.xlsx'),
                filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
            });

            if (canceled || !filePath) return; // If canceled or no file path, skip saving

            // Save the file
            await saveToExcel(filePath, [...[items.metadata], ...items.data], items.title);
        }
    });
}




