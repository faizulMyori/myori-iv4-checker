"use client"

export function useReportDownload(
  capturedData: any[],
  missingData: any[],
  duplicatedData: any[],
  manualRejectEntries: any[],
  batchNo: string,
  productData: any,
  unusedSerials: string[] = [],
) {
  const handleDownload = (section: string) => {
    // Common metadata for most sections
    const metadata = ["SIRIM SERIAL NO.", "BATCH NO", "BRAND/TRADEMARK", "MODEL", "TYPE", "RATING", "SIZE"]

    // Function to map data items to the common structure
    const mapData = (dataSource: any[]) => {
      return dataSource.map((item: any) => [
        item.serial || item.serialNumber, // Handle different naming conventions
        batchNo,
        productData.brand,
        productData.model,
        productData.type,
        productData.rating,
        productData.size,
      ])
    }

    let data: any = []
    let title = "Report"
    let sheets = []

    // For different sections, get the relevant data
    switch (section) {
      case "captured":
        data = capturedData.filter(
          (item) =>
            !missingData.some((dup) => dup.serial === item.serial) &&
            !manualRejectEntries.some((dup) => dup.serialNumber === item.serial) &&
            item.status !== "NG",
        )
        title = "SIRIM REPORT"
        console.log(productData)
        sheets.push({ title, metadata, data: mapData(data) })
        break

      case "manual-reject":
        data = manualRejectEntries
        title = "MANUAL REJECT REPORT"
        sheets.push({ title, metadata, data: mapData(data) })
        break

      case "missing":
        data = missingData
        title = "MISSING REPORT"
        sheets.push({ title, metadata, data: mapData(data) })
        break

      case "duplicate":
        data = duplicatedData
        title = "DUPLICATE REPORT"
        sheets.push({ title, metadata, data: mapData(data) })
        break

      case "unused-serials":
        metadata.splice(1) // Only "SIRIM SERIAL NO."
        data = (unusedSerials || []).map((item: string) => [item])
        title = "UNUSED SERIALS REPORT"
        sheets.push({ title, metadata, data })
        break

      case "all":
        // Combine all sections' data into a single download
        sheets = [
          {
            title: "SIRIM REPORT",
            metadata,
            data: mapData(
              capturedData.filter(
                (item) =>
                  !missingData.some((dup) => dup.serial === item.serial) &&
                  !manualRejectEntries.some((dup) => dup.serialNumber === item.serial),
              ),
            ),
          },
          { title: "MANUAL REJECT REPORT", metadata, data: mapData(manualRejectEntries) },
          { title: "MISSING REPORT", metadata, data: mapData(missingData) },
          { title: "DUPLICATE REPORT", metadata, data: mapData(duplicatedData) },
          {
            title: "UNUSED SERIALS REPORT",
            metadata: ["SIRIM SERIAL NO."],
            data: (unusedSerials || []).map((item: string) => [item]),
          },
        ]
        break

      default:
        console.error("Invalid section")
        return
    }

    // Save all the sections to Excel
    try {
      window.excel.save_to_excel(sheets)
    } catch (error) {
      console.error("Failed to save to Excel:", error)
    }
  }

  return { handleDownload }
}

