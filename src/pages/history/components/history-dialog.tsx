"use client"

import React, { useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Label } from "../types"

interface HistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    data: Label[];
    onDataChange?: () => void;
}

export function HistoryDialog({ open, onOpenChange, title, data, onDataChange }: HistoryDialogProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredData, setFilteredData] = useState<Label[]>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const itemsPerPage = 100

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query)
        setPage(1)
        if (!query) {
            setFilteredData(data.slice(0, itemsPerPage))
            return
        }
        const filtered = data.filter(item =>
            item.serial_number.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredData(filtered.slice(0, itemsPerPage))
    }, [data])

    const loadMoreData = useCallback(() => {
        if (loading) return;

        setLoading(true);
        const nextPage = page + 1;
        const start = 0;
        const end = nextPage * itemsPerPage;

        let newData;
        if (!searchQuery) {
            newData = data.slice(start, end);
        } else {
            newData = data
                .filter(item => item.serial_number.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(start, end);
        }

        setFilteredData(newData);
        setPage(nextPage);
        setLoading(false);
    }, [page, data, searchQuery, loading]);

    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            loadMoreData();
        }
    }, [loadMoreData]);

    const handleDeleteSerial = async (id: number) => {
        try {
            await window.sqlite.delete_label(id);
            setFilteredData(prev => prev.filter(item => item.id !== id));
            onDataChange?.();
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting serial:", error);
        }
    }

    const openDeleteDialog = (id: number) => {
        setSelectedId(id);
        setDeleteDialogOpen(true);
    }

    useEffect(() => {
        if (open) {
            setFilteredData(data.slice(0, itemsPerPage))
            setSearchQuery("")
            setPage(1)
        }
    }, [open, data])

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Search serial numbers..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <div
                            ref={scrollContainerRef}
                            className="max-h-[60vh] overflow-y-auto"
                            onScroll={handleScroll}
                        >
                            <div className="grid grid-cols-1 gap-2">
                                {filteredData.map((item) => (
                                    <div key={item.id} className="p-2 border rounded flex justify-between items-center">
                                        <span>{item.serial_number}</span>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => openDeleteDialog(item.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {loading && <div className="text-center py-2">Loading...</div>}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this serial number?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => selectedId && handleDeleteSerial(selectedId)}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
} 