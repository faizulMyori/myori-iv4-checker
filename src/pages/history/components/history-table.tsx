"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useCallback, useMemo, useEffect } from "react"
import React from "react"
import { HistoryData } from "../types"

interface HistoryTableProps {
    data: HistoryData[];
    onViewSerialNumbers: (item: HistoryData) => void;
    onDeleteBatch: (item: HistoryData) => void;
    onGenerateReport: (item: HistoryData) => void;
}

export function HistoryTable({ data, onViewSerialNumbers, onDeleteBatch, onGenerateReport }: HistoryTableProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredData, setFilteredData] = useState(data)

    useEffect(() => {
        setSearchQuery("")
        setFilteredData(data)
    }, [data])

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query)
        if (!query) {
            setFilteredData(data)
            return
        }
        const filtered = data.filter(item =>
            item.batch_no.toLowerCase().includes(query.toLowerCase()) ||
            item.shift_number.toLowerCase().includes(query.toLowerCase()) ||
            item.product?.sku.toLowerCase().includes(query.toLowerCase()) ||
            item.labels.some(label => label.serial_number.toLowerCase().includes(query.toLowerCase()))
        )
        setFilteredData(filtered)
    }, [data])

    const columns = useMemo(() => [
        {
            key: "batch_no",
            label: "Batch No.",
        },
        {
            key: "shift_number",
            label: "Shift No.",
        },
        {
            key: "product",
            label: "Product",
        },
        {
            key: "date",
            label: "Date",
        },
        {
            key: "totalLabels",
            label: "Total Labels",
        },
    ], [])

    return (
        <div className="space-y-4 h-[calc(100vh-12rem)]">
            <Input
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
            />
            <div className="rounded-md border h-full">
                <ScrollArea className="h-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead key={column.key}>{column.label}</TableHead>
                                ))}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.batch_no}</TableCell>
                                    <TableCell>{item.shift_number}</TableCell>
                                    <TableCell>{item.product?.sku || "N/A"}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>{item.totalLabels}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => onViewSerialNumbers(item)}
                                            >
                                                View Serial Numbers
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onGenerateReport(item)}
                                            >
                                                {item.reportExists ? "Open Report" : "Generate Report"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => onDeleteBatch(item)}
                                                disabled={item.labels.length > 0}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    )
} 