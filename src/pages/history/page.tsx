"use client"

import { useState, useEffect } from "react"
import { fetchBatchData } from "@/lib/utils"
import { HistoryTable } from "./components/history-table"
import { HistoryDialog } from "./components/history-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { getSettings } from "@/helpers/settings_helpers"
import React from "react"
import { HistoryData } from "./types"

export default function Index() {
    const [data, setData] = useState<HistoryData[]>([])
    const [selectedItem, setSelectedItem] = useState<HistoryData | null>(null)
    const [isSerialDialogOpen, setIsSerialDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const fetchBatchHistories = async () => {
        console.log("Fetching batch histories...")
        try {
            const response = await fetchBatchData(1, 100)
            // Get save path from settings
            const settings = await getSettings()
            const savePath = JSON.parse(settings.excelSavePath)

            // Check report existence for each batch
            const batchesWithReportStatus = await Promise.all(
                response.batches.map(async (batch) => {
                    const date = new Date()
                    const day = String(date.getDate()).padStart(2, '0')
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const year = date.getFullYear()
                    const dateStr = `${day}-${month}-${year}`
                    const title = "SIRIM REPORT"
                    const filePath = `${savePath}/${dateStr}-${title}-${batch.batch_no}-${batch.shift_number}.xlsx`

                    try {
                        const fileExists = await window.electronWindow.checkFileExists(filePath)
                        return { ...batch, reportExists: fileExists }
                    } catch (error) {
                        console.error(`Error checking report existence for batch ${batch.batch_no}:`, error)
                        return { ...batch, reportExists: false }
                    }
                })
            )

            setData(batchesWithReportStatus)
        } catch (error) {
            console.error("Error fetching batch histories:", error)
        }
    }

    useEffect(() => {
        console.log("Initial fetch")
        fetchBatchHistories()
    }, [])

    const handleViewSerialNumbers = (item: HistoryData) => {
        setSelectedItem(item)
        setIsSerialDialogOpen(true)
    }

    const handleDeleteBatch = (item: HistoryData) => {
        setSelectedItem(item)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        console.log("Starting delete operation")
        if (!selectedItem) return

        try {
            await window.sqlite.delete_batch(selectedItem.id)
            console.log("Batch deleted, refreshing data")
            await fetchBatchHistories()
        } catch (error) {
            console.error("Error deleting batch:", error)
        } finally {
            console.log("Cleaning up state")
            setIsDeleteDialogOpen(false)
            setSelectedItem(null)
        }
    }

    const handleGenerateReport = async (item: HistoryData) => {
        try {
            // Get save path from settings
            const settings = await getSettings()
            const savePath = JSON.parse(settings.excelSavePath)

            // Generate date string in DD-MM-YYYY format
            const date = new Date()
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            const dateStr = `${day}-${month}-${year}`

            // Create file path with both batch number and shift number
            const title = "SIRIM REPORT"
            const filePath = `${savePath}/${dateStr}-${title}-${item.batch_no}-${item.shift_number}.xlsx`

            // Prepare data for Excel
            const metadata = ["SIRIM SERIAL NO.", "BATCH NO", "SHIFT NO", "BRAND/TRADEMARK", "MODEL", "TYPE", "RATING", "SIZE"]
            const data = item.labels.map(label => [
                label.serial_number,
                item.batch_no,
                item.shift_number,
                item.product?.brand || "",
                item.product?.model || "",
                item.product?.type || "",
                item.product?.rating || "",
                item.product?.size || "",
            ])

            // Check if file exists
            try {
                const fileExists = await window.electronWindow.checkFileExists(filePath)
                if (fileExists) {
                    // File exists, open location
                    toast.info("File already exists", {
                        description: "Opening file location...",
                    })
                    await window.electronWindow.openFileLocation(filePath)
                } else {
                    // File doesn't exist, generate new one
                    await window.excel.save_to_excel([{ title, metadata, data }], filePath)
                    toast.success("Excel file saved successfully", {
                        description: `File saved to: ${filePath}`,
                    })
                }
            } catch (error) {
                console.error("Error checking file existence:", error)
                // If there's an error checking, try to generate the file anyway
                await window.excel.save_to_excel([{ title, metadata, data }], filePath)
                toast.success("Excel file saved successfully", {
                    description: `File saved to: ${filePath}`,
                })
            }

            // Double check if file still exists after opening location
            try {
                const fileStillExists = await window.electronWindow.checkFileExists(filePath)
                if (!fileStillExists) {
                    // File was deleted, generate new one
                    await window.excel.save_to_excel([{ title, metadata, data }], filePath)
                    toast.success("Excel file regenerated successfully", {
                        description: `File was regenerated at: ${filePath}`,
                    })
                }
            } catch (error) {
                console.error("Error verifying file after opening:", error)
                // If there's an error checking, try to generate the file anyway
                await window.excel.save_to_excel([{ title, metadata, data }], filePath)
                toast.success("Excel file regenerated successfully", {
                    description: `File was regenerated at: ${filePath}`,
                })
            }

            // Refresh the data to update report existence status
            await fetchBatchHistories()
        } catch (error) {
            console.error("Error generating report:", error)
            toast.error("Failed to generate report", {
                description: error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Batch History</h1>
            <HistoryTable
                data={data}
                onViewSerialNumbers={handleViewSerialNumbers}
                onDeleteBatch={handleDeleteBatch}
                onGenerateReport={handleGenerateReport}
            />

            <HistoryDialog
                open={isSerialDialogOpen}
                onOpenChange={setIsSerialDialogOpen}
                title="Serial Numbers"
                data={selectedItem?.labels || []}
                onDataChange={fetchBatchHistories}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete batch {selectedItem?.batch_no}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
