"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import TableWithPagination from "@/components/TableWithPagination"
import React from "react"

interface SerialNumberListProps {
    data: any[]
}

export default function SerialNumberList({ data }: SerialNumberListProps) {
    const [filteredData, setFilteredData] = useState(data)

    const columns = [
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
    ]

    const handleSearch = (query: string) => {
        try {
            if (!query) {
                setFilteredData(data)
                return
            }

            setFilteredData(data.filter((item: any) => item.serial.toLowerCase().includes(query.toLowerCase())))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <ScrollArea className="h-[calc(100vh-200px)] w-full">
            <div className="min-w-[600px]">
                <TableWithPagination
                    title="Serial No Lists"
                    description="View serial no lists"
                    columns={columns}
                    data={filteredData || []}
                    pagination={{
                        currentPage: 1,
                        perPage: 10,
                        total: filteredData.length,
                        from: 0,
                        to: filteredData.length,
                        nextUrl: null,
                        prevUrl: null,
                    }}
                    actions={[]}
                    onSearch={handleSearch}
                    onPageChange={() => { }}
                    canAdd={false}
                    hideActions={true}
                />
            </div>
        </ScrollArea>
    )
}
