"use client"

import { Download, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduction } from "../context/production-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import React from "react"

export default function CapturedData() {
  const { capturedData, handleDownload, labelRolls, batchNo, productData } = useProduction()
  const [isHovering, setIsHovering] = useState(false)
  const [allSerialsData, setAllSerialsData] = useState<any[]>([])

  useEffect(() => {
    const generateAllSerials = () => {
      // Generate all serials from label rolls
      const allSerials = labelRolls.flatMap(({ startNumber, endNumber }: any) => {
        if (!startNumber || !endNumber) return []

        const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/)
        const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/)

        if (!startMatch || !endMatch) return [] // Skip if format is invalid

        const prefix = startMatch[1]
        const numLength = startMatch[2].length
        const start = Number.parseInt(startMatch[2], 10)
        const end = Number.parseInt(endMatch[2], 10)

        return isNaN(start) || isNaN(end) || start > end
          ? [] // Ensure valid range
          : Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${String(start + i).padStart(numLength, "0")}`)
      })

      // Map serials to include all required product details
      const mappedData = allSerials.map((serial: any) => [
        serial,
        batchNo,
        productData.brand,
        productData.model,
        productData.type,
        productData.rating,
        productData.size,
      ])

      setAllSerialsData(mappedData)
    }

    generateAllSerials()
  }, [labelRolls, batchNo, productData])

  const generateAndDownloadAllSerials = () => {
    // Download as Excel
    try {
      window.excel.save_to_excel([
        {
          title: "SIRIM REPORT (system)",
          metadata: ["SIRIM SERIAL NO.", "BATCH NO", "BRAND/TRADEMARK", "MODEL", "TYPE", "RATING", "SIZE"],
          data: allSerialsData,
        },
      ])
    } catch (error) {
      console.error("Failed to save to Excel:", error)
    }
  }

  return (
    <Card className="col-span-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">READING CAPTURED DATA</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{capturedData.length}</div>
          <Button variant="ghost" size="sm" onClick={() => handleDownload("captured")}>
            <Download className="h-4 w-4" />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateAndDownloadAllSerials}
                  className={`transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}
                  onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate and download all serials from label rolls</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] overflow-y-auto">
        {[...capturedData].reverse().map((item: any, index: number) => (
          <div key={index} className="text-sm">
            {`${item.serial}, ${item.url}, ${item.status}`}
          </div>
        ))}
        {capturedData.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No captured serial numbers</div>
        )}
      </CardContent>
    </Card>
  )
}
