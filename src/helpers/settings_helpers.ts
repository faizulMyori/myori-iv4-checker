interface ExcelPath {
    excel_save_path: string;
    created_at: number;
}

interface ExcelPathResult {
    excelSavePath: string;
    createdAt: number;
}

export async function getSettings(): Promise<ExcelPathResult> {
    try {
        const result = await window.sqlite.get_excel_save_path();
        if (result && result.path) {
            return {
                excelSavePath: result.path,
                createdAt: Date.now()
            };
        }
        return {
            excelSavePath: "C:/",
            createdAt: Date.now()
        };
    } catch (error) {
        console.error("Error fetching Excel path:", error);
        return {
            excelSavePath: "C:/",
            createdAt: Date.now()
        };
    }
}

export async function updateSettings(excelSavePath: string): Promise<boolean> {
    try {
        await window.sqlite.create_excel_save_path(excelSavePath);
        return true;
    } catch (error) {
        console.error("Error updating Excel path:", error);
        return false;
    }
} 