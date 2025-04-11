"use client"
import TableWithPagination from "@/components/TableWithPagination"
import { Button } from "@/components/ui/button"
import React, { useCallback } from "react"

interface BatchHistoryTableProps {
    data: any[]
    pagination: {
        currentPage: number
        perPage: number
        total: number
        from: number
        to: number
        nextUrl: string | null
        prevUrl: string | null
    }
    onSearch: (query: string) => void
    onPageChange: (url: string) => void
    onViewSerialNumbers: (item: any) => void
    onDeleteBatch: (item: any) => void
}

export default function BatchHistoryTable({
    data,
    pagination,
    onSearch,
    onPageChange,
    onViewSerialNumbers,
    onDeleteBatch,
}: BatchHistoryTableProps) {
    const handleViewSerialNumbers = useCallback((item: any) => {
        onViewSerialNumbers(item)
    }, [onViewSerialNumbers])

    const handleDeleteBatch = useCallback((item: any) => {
        onDeleteBatch(item)
    }, [onDeleteBatch])

    const columns = [
        {
            key: "batch_no",
            label: "Batch No.",
            hidden: false,
            render: (item: any) => item.batch_no,
        },
        {
            key: "shift_number",
            label: "Shift No.",
            hidden: false,
            render: (item: any) => item.shift_number,
        },
        {
            key: "serial_no",
            label: "Serial No.",
            hidden: false,
            render: (item: any) => (
                <Button
                    size="sm"
                    onClick={() => handleViewSerialNumbers(item)}
                >
                    Open List
                </Button>
            ),
        },
        {
            key: "label_count",
            label: "Label Count",
            hidden: false,
            render: (item: any) => item.labels.length,
        },
        {
            key: "date",
            label: "Date",
            hidden: false,
            render: (item: any) => new Date(item.date).toLocaleDateString("en-GB"),
        },
    ]

    const actions = [
        {
            label: "Delete",
            onClick: handleDeleteBatch,
        },
    ]

    return (
        <TableWithPagination
            title="Search"
            description="Search histories and view their data."
            columns={columns}
            data={data}
            pagination={pagination}
            actions={actions}
            onSearch={onSearch}
            onPageChange={onPageChange}
            canAdd={false}
            hideActions={false}
        />
    )
}
