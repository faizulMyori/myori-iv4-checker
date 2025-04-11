"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProduction } from "../context/production-context"
import React from "react"

export default function ManualRejectData() {
  const {
    manualRejectEntries,
    isManualRejectModalOpen,
    setIsManualRejectModalOpen,
    newSerialNumbers,
    handleSerialNumberChange,
    handleAddSerialNumberField,
    handleRemoveSerialNumberField,
    addManualRejectEntries,
    handleDeleteEntry,
    handleDownload,
  } = useProduction()
  const [deleteEntryId, setDeleteEntryId] = React.useState<string | null>(null)
  const [deleteEntrySerial, setDeleteEntrySerial] = React.useState<string | null>(null)

  const handleDelete = (id: string, serialNumber: string) => {
    setDeleteEntryId(id)
    setDeleteEntrySerial(serialNumber)
  }

  const confirmDelete = () => {
    if (deleteEntryId) {
      handleDeleteEntry(deleteEntryId)
      setDeleteEntryId(null)
      setDeleteEntrySerial(null)
    }
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">MANUAL-REJECT SERIAL NO</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{manualRejectEntries.length}</div>
          <Button variant="ghost" size="sm" onClick={() => handleDownload("manual-reject")}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] overflow-y-auto">
        <div className="space-y-2">
          {[...manualRejectEntries].reverse().map((entry: any) => (
            <div key={entry.id} className="flex items-center justify-between text-sm">
              <span>{entry.serialNumber}</span>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id, entry.serialNumber)} className="ml-2">
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Dialog open={isManualRejectModalOpen} onOpenChange={setIsManualRejectModalOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="mt-4">
              ADD ENTRY
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Manual Reject Entries</DialogTitle>
              <DialogDescription>Enter the serial numbers for the manual reject entries.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {newSerialNumbers.map((serialNumber: any, index: any) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`serialNumber-${index}`} className="text-right">
                    Serial Number {index + 1}
                  </Label>
                  <Input
                    id={`serialNumber-${index}`}
                    value={serialNumber}
                    onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                    className="col-span-3"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveSerialNumberField(index)}
                    className="col-span-1"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleAddSerialNumberField}>
                Add Another Serial Number
              </Button>
              <Button type="button" onClick={addManualRejectEntries}>
                Add Entries
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteEntryId !== null} onOpenChange={() => setDeleteEntryId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Removal</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {deleteEntrySerial} from manual reject data?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteEntryId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

