"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import TableWithPagination from "@/components/TableWithPagination"
import React from "react"

interface SerialNumberListProps {
    data: any[]
}

export default function SerialNumberList({ data }: SerialNumberListProps) {
    const [filteredData, setFilteredData] = useState(data)

    useEffect(() => {
        setFilteredData(data)
    }, [data])

    const columns = useMemo(() => [
        {
            key: "serial_no",
            label: "Serial No.",
            hidden: false,
            render: (item: any) => item.serial,
        },
        {
            key: "qr_code",
            label: "QR Code",
            hidden: false,
            render: (item: any) => item.qr_code,
        },
        {
            key: "status",
            label: "Status",
            hidden: false,
            render: (item: any) => item.status,
        },
    ], [])

    const handleSearch = useCallback((query: string) => {
        if (!query) {
            setFilteredData(data)
            return
        }

        const filtered = data.filter((item: any) =>
            item.serial.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredData(filtered)
    }, [data])

    const pagination = useMemo(() => ({
        currentPage: 1,
        perPage: 10,
        total: filteredData.length,
        from: 0,
        to: filteredData.length,
        nextUrl: null,
        prevUrl: null,
    }), [filteredData.length])

    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
                <div className="min-w-[600px] p-4">
                    <TableWithPagination
                        title="Serial No Lists"
                        description="View serial no lists"
                        columns={columns}
                        data={filteredData}
                        pagination={pagination}
                        actions={[]}
                        onSearch={handleSearch}
                        onPageChange={() => { }}
                        canAdd={false}
                        hideActions={true}
                    />
                </div>
            </ScrollArea>
        </div>
    )
}
