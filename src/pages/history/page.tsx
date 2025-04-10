"use client"
import { useState, useEffect } from "react"
import BatchHistoryTable from "./components/serial-number-list"
import Footer from "@/components/template/Footer"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { FormDialog } from "@/components/FormDialog"
import SerialNumberList from "./components/batch-history-table"
import { fetchBatchData } from "@/lib/utils"
import React from "react"

export default function Index() {
    const [histories, setHistories] = useState({
        data: [],
        total: 0,
        from: 0,
        to: 0,
        per_page: 0,
        current_page: 0,
        next_page_url: null,
        prev_page_url: null,
    })

    const [savedHistories, setSavedHistories] = useState([])
    const [form, setForm] = useState<any>(null)
    const [openForm, setOpenForm] = useState(false)
    const [deleteDialog, setOpenDeleteDialog] = useState(false)

    const handleSearch = (query: string) => {
        try {
            if (!query) {
                // If query is empty, reset to full data
                setHistories({ ...histories, data: savedHistories })
                return
            }

            // Always filter from initialData, not the current filtered state
            const filteredData = savedHistories.filter((item: any) =>
                item.batch_no?.toLowerCase().includes(query.toLowerCase()),
            )

            setHistories({ ...histories, data: filteredData })
        } catch (error) {
            console.error("Search Error:", error)
        }
    }

    const handlePageChange = (url: string) => {
        // router.get(url, {}, { preserveState: true })
    }

    const handleViewSerialNumbers = (item: any) => {
        setForm(item.labels)
        setOpenForm(true)
    }

    const handleDeleteBatch = (item: any) => {
        setForm(item)
        setOpenDeleteDialog(true)
    }

    const handleConfirmDelete = () => {
        if (form?.labels.length > 0) {
            return alert("Cannot delete batch with labels")
        }
        try {
            window.sqlite
                .delete_batch(form.id)
                .then(() => {
                    setOpenDeleteDialog(false)
                    fetchBatchHistories()
                })
                .catch((error: any) => {
                    console.error("Delete error:", error)
                })
        } catch (error) {
            console.log(error)
        }
    }

    const fetchBatchHistories = async () => {
        try {
            const data = await fetchBatchData()
            setHistories({
                ...histories,
                data: data,
            })
            setSavedHistories(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (!deleteDialog || !openForm) {
            fetchBatchHistories()
        }
    }, [openForm, deleteDialog])

    return (
        <div className="flex h-full flex-col p-4 overflow-y-auto scrollbar w-full">
            <div className="flex flex-1 flex-col gap-2 pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Search</h2>
                </div>
                <div className="flex flex-col gap-4">
                    <BatchHistoryTable
                        data={histories?.data || []}
                        pagination={{
                            currentPage: histories?.current_page || 1,
                            perPage: histories?.per_page || 10,
                            total: histories?.total || 0,
                            from: histories?.from || 0,
                            to: histories?.to || 0,
                            nextUrl: histories?.next_page_url || null,
                            prevUrl: histories?.prev_page_url || null,
                        }}
                        onSearch={handleSearch}
                        onPageChange={handlePageChange}
                        onViewSerialNumbers={handleViewSerialNumbers}
                        onDeleteBatch={handleDeleteBatch}
                    />
                </div>
            </div>
            <Footer />

            {deleteDialog && (
                <ConfirmDialog
                    open={deleteDialog}
                    setConfirm={handleConfirmDelete}
                    title="Confirm to delete?"
                    message={`Are you sure you want to delete batch ${form.batch_no}? This action cannot be undone.`}
                    setOpen={setOpenDeleteDialog}
                />
            )}

            {openForm && (
                <FormDialog
                    setOpenForm={setOpenForm}
                    openDialog={openForm}
                    formType="view"
                    setConfirmForm={(e: any) => e.preventDefault()}
                    title="Serial No Lists"
                    forms={<SerialNumberList data={form} />}
                    processing={false}
                    size="lg:max-w-3xl"
                />
            )}
        </div>
    )
}
