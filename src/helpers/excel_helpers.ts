import XLSX from 'xlsx';

export async function saveToExcel(filePath:any, sheetData:any, sheetName:any) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filePath);
    return filePath;
}