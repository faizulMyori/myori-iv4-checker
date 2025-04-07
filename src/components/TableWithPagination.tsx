import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MoreHorizontal, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react'
// import { usePage } from '@inertiajs/react'

interface Column {
    key: string,
    style?: string,
    label: string | React.JSX.Element,
    hidden: boolean,
    render?: (item: any) => React.ReactNode
}

interface Action {
    label: any
    onClick: (item: any) => void
    disabled?: any
    permission?: string,
    separator?: boolean
}

interface ReusableTableProps {
    title: string
    description: string
    columns: Column[]
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
    actions: Action[]
    onSearch: (query: string) => void
    onPageChange: (url: string) => void
    onAdd?: (e: React.MouseEvent) => void
    addPermission?: string
    onClickRow?: (item: any) => void
    canAdd?: boolean
    hideActions?: boolean
}

export default function TableWithPagination({
    title,
    description,
    columns,
    data,
    pagination,
    actions,
    onSearch,
    onPageChange,
    onAdd,
    addPermission,
    onClickRow,
    canAdd,
    hideActions = false
}: ReusableTableProps) {
    const [searchValue, setSearchValue] = useState('')
    // const permissions = usePage().props.auth.permissions
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const previousSearchRef = useRef<string>('')
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({})

    const debouncedSearch = useCallback((query: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (query !== previousSearchRef.current) {
                onSearch(query)
                previousSearchRef.current = query
            }
        }, 300)
    }, [onSearch])

    useEffect(() => {
        debouncedSearch(searchValue)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchValue, debouncedSearch])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    const toggleRowExpansion = (id: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const renderMobileRow = (item: any) => {
        const visibleColumns = columns.filter(col => !col.hidden).slice(0, 2)
        const hiddenColumns = columns.filter(col => col.hidden || columns.indexOf(col) >= 2)

        return (
            <Card key={item.id} className="mb-4">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                            {visibleColumns.map((column) => (
                                <div key={column.key}>
                                    {column.render ? column.render(item) : item[column.key]}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleRowExpansion(item.id)}
                            >
                                {expandedRows[item.id] ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    {actions.map((action) => (
                                        <DropdownMenuItem
                                            key={typeof action.label === 'string' ? action.label : 'dynamic-label'}
                                            onSelect={() => action.onClick(item)}
                                            disabled={typeof action.disabled === 'function' ? action.disabled(item) : action.disabled}
                                        >
                                            {typeof action.label === 'function' ? action.label(item) : action.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    {expandedRows[item.id] && (
                        <div className="border-t p-4 space-y-2">
                            {hiddenColumns.map((column) => (
                                <div key={column.key} className="grid grid-cols-2 gap-2">
                                    <span className="font-medium text-muted-foreground truncate">
                                        {typeof column.label === 'object' && React.isValidElement(column.label) && column.label.type === Button
                                            ? (column.label as React.ReactElement<any>).props.children[0]
                                            : column.label}:
                                    </span>
                                    <span className="truncate">{column.render ? column.render(item) : item[column.key]}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="flex items-center mb-2">
                <div className="ml-auto flex items-center gap-2">
                    {canAdd && (
                        <Button
                            size="sm"
                            className="h-8 gap-1"
                            onClick={onAdd}
                        >
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Create {title}
                            </span>
                        </Button>
                    )}
                </div>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            onChange={handleSearchChange}
                            value={searchValue}
                            className="w-full"
                            placeholder={`Search ${title.toLowerCase()}...`}
                            type="search"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        {/* Desktop View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {columns.map((column) => (
                                            !column.hidden && (<TableHead className={column.style} key={column.key}>{column.label}</TableHead>)
                                        ))}
                                        <TableHead>
                                            <span className="sr-only">Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.length > 0 ? (
                                        data.map((item) => (
                                            <TableRow key={item.id}>
                                                {columns.map((column) => (
                                                    !column.hidden &&
                                                    <TableCell className={column.style} key={column.key}>
                                                        {column.render ? column.render(item) : item[column.key]}
                                                    </TableCell>
                                                ))}
                                                {
                                                    !hideActions &&
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Toggle menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {canAdd && actions.map((action, index) => (
                                                                    <div key={index}>
                                                                        <DropdownMenuItem
                                                                            key={typeof action.label === 'string' ? action.label : 'dynamic-label'}
                                                                            onSelect={() => action.onClick(item)}
                                                                            disabled={typeof action.disabled === 'function' ? action.disabled(item) : action.disabled}
                                                                        >
                                                                            {typeof action.label === 'function' ? action.label(item) : action.label}
                                                                        </DropdownMenuItem>
                                                                        {action.separator && <DropdownMenuSeparator />}
                                                                    </div>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                }
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell className="font-medium text-center" colSpan={columns.length + 1}>
                                                No Data
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {data.length > 0 ? (
                                data.map(renderMobileRow)
                            ) : (
                                <div className="text-center py-4">No Data</div>
                            )}
                        </div>
                    </div>
                </CardContent>
                {/* <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{pagination.from}-{pagination.to}</strong> of{" "}
                        <strong>{pagination.total}</strong> {title.toLowerCase()}
                    </div>
                    <Pagination className="ml-auto mr-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    disabled={!pagination.prevUrl}
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={() => pagination.prevUrl && onPageChange(pagination.prevUrl)}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    <span className="sr-only">Previous {title}</span>
                                </Button>
                            </PaginationItem>
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    disabled={!pagination.nextUrl}
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={() => pagination.nextUrl && onPageChange(pagination.nextUrl)}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                    <span className="sr-only">Next {title}</span>
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardFooter> */}
            </Card>
        </>
    )
}