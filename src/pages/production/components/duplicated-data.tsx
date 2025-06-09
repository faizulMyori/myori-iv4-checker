"use client"

import { Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduction } from "../context/production-context"
import { toast } from "sonner"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"

export default function DuplicatedData() {
  const {
    duplicatedData,
    handleDownload,
    handleRemoveDuplicatedEntry,
    capturedData,
  } = useProduction()

  const [deleteSerial, setDeleteSerial] = React.useState<string | null>(null)

  const handleRemove = (serial: string) => {
    setDeleteSerial(serial)
  }

  const confirmDelete = () => {
    if (deleteSerial) {
      handleRemoveDuplicatedEntry(deleteSerial)

      const isInCapturedData = capturedData.some((item: any) => item.serial === deleteSerial)

      toast.success("Serial number removed", {
        description: isInCapturedData
          ? `${deleteSerial} has been removed from duplicated data.`
          : `${deleteSerial} has been removed from duplicated data and returned to unused serials.`,
      })

      setDeleteSerial(null)
    }
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = [...duplicatedData].reverse()[index]

    return (
      <div
        style={style}
        className="text-sm text-red-500 flex justify-between items-center p-1 hover:bg-muted/30 rounded"
      >
        <span>{`${item.serial}, ${item.url}, ${item.status}`}</span>
        <Button
          variant="destructive"
          size="sm"
          className="h-7 px-2 ml-2"
          onClick={() => handleRemove(item.serial)}
          title="Remove from duplicated data"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">DUPLICATED SERIAL NO</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{duplicatedData.length}</div>
          <Button variant="ghost" size="sm" onClick={() => handleDownload("duplicate")}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] p-0">
        {duplicatedData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No duplicated serial numbers</div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={200}
                width={width}
                itemCount={duplicatedData.length}
                itemSize={42}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        )}
      </CardContent>

      <Dialog open={deleteSerial !== null} onOpenChange={() => setDeleteSerial(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {deleteSerial} from duplicated data?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSerial(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
