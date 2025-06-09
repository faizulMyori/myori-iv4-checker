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

export default function MissingData() {
  const { missingData, handleDownload, handleRemoveMissingEntry } = useProduction()
  const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null)
  const [deleteSerial, setDeleteSerial] = React.useState<string | null>(null)

  const handleRemove = (index: number, serial: string) => {
    setDeleteIndex(index)
    setDeleteSerial(serial)
  }

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      handleRemoveMissingEntry(missingData.length - 1 - deleteIndex) // Adjust index since reversed
      toast.success("Serial number removed", {
        description: `${deleteSerial} has been removed from missing data.`,
      })
      setDeleteIndex(null)
      setDeleteSerial(null)
    }
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = [...missingData].reverse()[index]

    return (
      <div
        key={index}
        style={style}
        className="text-sm text-red-500 flex justify-between items-center p-1 hover:bg-muted/30 rounded"
      >
        <span>{`${item.serial}, ${item.url}, ${item.status}`}</span>
        <Button
          variant="destructive"
          size="sm"
          className="h-7 px-2 ml-2"
          onClick={() => handleRemove(index, item.serial)}
          title="Remove from missing data"
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
        <CardTitle className="text-lg">MISSING SERIAL NO & NG</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{missingData.length}</div>
          <Button variant="ghost" size="sm" onClick={() => handleDownload("missing")}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] p-0">
        {missingData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No missing serial numbers</div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={200}
                width={width}
                itemCount={missingData.length}
                itemSize={42}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        )}
      </CardContent>

      <Dialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {deleteSerial} from missing data?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIndex(null)}>
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
