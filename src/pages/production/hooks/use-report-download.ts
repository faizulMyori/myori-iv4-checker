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
      // First map the data to the common structure
      const mappedData = dataSource.map((item: any) => [
        item.serial || item.serialNumber, // Handle different naming conventions
        batchNo,
        productData.brand,
        productData.model,
        productData.type,
        productData.rating,
        productData.size,
      ])

      // Then sort the mapped data by serial number (first element in each array)
      return mappedData.sort((a, b) => {
        // Extract the numeric part of the serial for proper numeric sorting
        const aMatch = a[0]?.match(/^([A-Za-z]+)(\d+)$/)
        const bMatch = b[0]?.match(/^([A-Za-z]+)(\d+)$/)

        if (!aMatch || !bMatch) return a[0]?.localeCompare(b[0] || "")

        // If prefixes are different, sort by prefix
        if (aMatch[1] !== bMatch[1]) return aMatch[1].localeCompare(bMatch[1])

        // If prefixes are the same, sort by numeric part
        return Number.parseInt(aMatch[2], 10) - Number.parseInt(bMatch[2], 10)
      })
    }

    let data: any = []
    let title = "Report"
    let sheets = []

    // For different sections, get the relevant data
    switch (section) {
      case "captured":
        data = capturedData.filter(
          (item) =>
            !manualRejectEntries.some((rej) => rej.serialNumber === item.serial)
        )
        title = "SIRIM REPORT"
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
        const sortedUnusedSerials = [...(unusedSerials || [])].sort((a, b) => {
          // Extract the numeric part of the serial for proper numeric sorting
          const aMatch = a.match(/^([A-Za-z]+)(\d+)$/)
          const bMatch = b.match(/^([A-Za-z]+)(\d+)$/)

          if (!aMatch || !bMatch) return a.localeCompare(b)

          // If prefixes are different, sort by prefix
          if (aMatch[1] !== bMatch[1]) return aMatch[1].localeCompare(bMatch[1])

          // If prefixes are the same, sort by numeric part
          return Number.parseInt(aMatch[2], 10) - Number.parseInt(bMatch[2], 10)
        })
        data = sortedUnusedSerials.map((item: string) => [item])
        title = "UNUSED SERIALS REPORT"
        sheets.push({ title, metadata, data })
        break

      case "all":
        // Combine all sections' data into a single download
        const sortedAllUnusedSerials = [...(unusedSerials || [])].sort((a, b) => {
          // Extract the numeric part of the serial for proper numeric sorting
          const aMatch = a.match(/^([A-Za-z]+)(\d+)$/)
          const bMatch = b.match(/^([A-Za-z]+)(\d+)$/)

          if (!aMatch || !bMatch) return a.localeCompare(b)

          // If prefixes are different, sort by prefix
          if (aMatch[1] !== bMatch[1]) return aMatch[1].localeCompare(bMatch[1])

          // If prefixes are the same, sort by numeric part
          return Number.parseInt(aMatch[2], 10) - Number.parseInt(bMatch[2], 10)
        })

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
            data: sortedAllUnusedSerials.map((item: string) => [item]),
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
