"use client"

import { Download, FileSpreadsheet, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduction } from "../context/production-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import React from "react"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer" // Optional for responsive sizing

export default function CapturedData() {
  const { capturedData, handleDownload, labelRolls, batchNo, productData, setCapturedData, unusedSerials, removeFromUnusedSerials, addToUnusedSerials, handleDeleteCapturedData } = useProduction()
  const [isHovering, setIsHovering] = useState(false)
  const [allSerialsData, setAllSerialsData] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false)
  const [startSerial, setStartSerial] = useState("")
  const [endSerial, setEndSerial] = useState("")
  const [manualSerial, setManualSerial] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [deleteEntry, setDeleteEntry] = useState<any | null>(null)

  // Set initial values when modal opens based on first label roll
  useEffect(() => {
    if (isModalOpen && labelRolls.length > 0 && labelRolls[0].startNumber && labelRolls[0].endNumber) {
      setStartSerial(labelRolls[0].startNumber)
      setEndSerial(labelRolls[0].endNumber)
    }
  }, [isModalOpen, labelRolls])

  const generateSerialRange = (start: string, end: string) => {
    // Extract prefix and number parts
    const startMatch = start.match(/^([A-Za-z]+)(\d+)$/)
    const endMatch = end.match(/^([A-Za-z]+)(\d+)$/)

    if (!startMatch || !endMatch) {
      toast.error("Invalid serial number format", {
        description: "Serial numbers should have a letter prefix followed by numbers (e.g., TBA001)",
      })
      return []
    }

    const startPrefix = startMatch[1]
    const endPrefix = endMatch[1]

    if (startPrefix !== endPrefix) {
      toast.error("Prefixes must match", {
        description: `Start prefix (${startPrefix}) doesn't match end prefix (${endPrefix})`,
      })
      return []
    }

    const prefix = startPrefix
    const startNum = Number.parseInt(startMatch[2], 10)
    const endNum = Number.parseInt(endMatch[2], 10)
    const numLength = startMatch[2].length

    if (isNaN(startNum) || isNaN(endNum)) {
      toast.error("Invalid serial numbers", {
        description: "Could not parse numeric parts of serial numbers",
      })
      return []
    }

    if (startNum > endNum) {
      toast.error("Invalid range", {
        description: "Start serial number must be less than or equal to end serial number",
      })
      return []
    }

    // Generate the range
    return Array.from(
      { length: endNum - startNum + 1 },
      (_, i) => `${prefix}${String(startNum + i).padStart(numLength, "0")}`,
    )
  }

  const handleGenerateAndDownload = () => {
    setIsGenerating(true)

    try {
      const serials = generateSerialRange(startSerial, endSerial)

      if (serials.length === 0) {
        setIsGenerating(false)
        return
      }

      // Map serials to include all required product details
      const mappedData = serials.map((serial) => [
        serial,
        batchNo,
        productData.brand,
        productData.model,
        productData.type,
        productData.rating,
        productData.size,
      ])

      // Download as Excel
      window.excel.save_to_excel([
        {
          title: "SIRIM REPORT (system)",
          metadata: ["SIRIM SERIAL NO.", "BATCH NO", "BRAND/TRADEMARK", "MODEL", "TYPE", "RATING", "SIZE"],
          data: mappedData,
        },
      ])

      toast.success("Excel file generated successfully", {
        description: `Generated ${serials.length} serial numbers from ${startSerial} to ${endSerial}`,
      })

      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to generate Excel:", error)
      toast.error("Failed to generate Excel file", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleManualEntry = () => {
    if (!manualSerial) {
      toast.error("Please enter a serial number")
      return
    }

    // Check if serial exists in unused serials
    if (unusedSerials.includes(manualSerial)) {
      const newEntry = {
        serial: manualSerial,
        url: new Date().toLocaleTimeString(),
        status: "OK"
      }

      setCapturedData([...capturedData, newEntry])
      removeFromUnusedSerials(manualSerial)
      setManualSerial("")
      setIsManualEntryModalOpen(false)
      toast.success("Serial number added successfully")
    } else {
      toast.error("Serial number not found in unused serials", {
        description: "Please verify the serial number is correct and within the label roll range"
      })
    }
  }

  const handleDeleteEntry = async (index: number) => {
    // Since we're using reverse(), we need to calculate the correct index
    const actualIndex = capturedData.length - 1 - index
    const entry = capturedData[actualIndex]
    setDeleteEntry(entry)
  }

  const confirmDelete = async () => {
    if (deleteEntry) {
      // Use the new delete function that handles both state and database
      await handleDeleteCapturedData(deleteEntry.serial)
      setDeleteEntry(null)
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsManualEntryModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className={`transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}
                  onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate and download serial range</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] p-0">
        {capturedData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No captured serial numbers</div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={200}
                width={width}
                itemCount={capturedData.length}
                itemSize={40}
                itemData={capturedData}
              >
                {({ index, style, data }) => {
                  const actualIndex = data.length - 1 - index
                  const item = data[actualIndex]

                  return (
                    <div
                      key={actualIndex}
                      style={style}
                      className="text-sm flex justify-between items-center px-4"
                    >
                      <span>{`${item.serial}, ${item.url}, ${item.status}`}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleDeleteEntry(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                }}
              </List>
            )}
          </AutoSizer>
        )}
      </CardContent>


      <Dialog open={deleteEntry !== null} onOpenChange={() => setDeleteEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {deleteEntry?.serial} from captured data?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEntry(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={isManualEntryModalOpen} onOpenChange={setIsManualEntryModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Manual Entry</DialogTitle>
            <DialogDescription>Enter a serial number to add to captured data.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manualSerial" className="text-right">
                Serial Number
              </Label>
              <Input
                id="manualSerial"
                value={manualSerial}
                onChange={(e) => setManualSerial(e.target.value)}
                placeholder="e.g. A001"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleManualEntry}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Serial Range Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Serial Number Range</DialogTitle>
            <DialogDescription>Enter the start and end serial numbers to generate an Excel report.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startSerial" className="text-right">
                Start Serial
              </Label>
              <Input
                id="startSerial"
                value={startSerial}
                onChange={(e) => setStartSerial(e.target.value)}
                placeholder="e.g. TBA001"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endSerial" className="text-right">
                End Serial
              </Label>
              <Input
                id="endSerial"
                value={endSerial}
                onChange={(e) => setEndSerial(e.target.value)}
                placeholder="e.g. TBA999"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateAndDownload} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate & Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
