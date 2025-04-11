"use client"

import { useState, useEffect } from "react"
import { fetchBatchData } from "@/lib/utils"
import { HistoryTable } from "./components/history-table"
import { HistoryDialog } from "./components/history-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
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
            setData(response.batches)
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

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Batch History</h1>
            <HistoryTable
                data={data}
                onViewSerialNumbers={handleViewSerialNumbers}
                onDeleteBatch={handleDeleteBatch}
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
