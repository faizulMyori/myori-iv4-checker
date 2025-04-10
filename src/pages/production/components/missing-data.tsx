"use client"

import { Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduction } from "../context/production-context"
import { toast } from "sonner"
import React from "react"

export default function MissingData() {
  const { missingData, handleDownload, handleRemoveMissingEntry } = useProduction()

  const handleRemove = (index: number, serial: string) => {
    handleRemoveMissingEntry(index)

    toast.success("Serial number removed", {
      description: `${serial} has been removed from missing data.`,
    })
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
      <CardContent className="h-[200px] overflow-y-auto">
        {[...missingData].reverse().map((item: any, index: number) => (
          <div
            key={index}
            className="text-sm text-red-500 flex justify-between items-center mb-2 p-1 hover:bg-muted/30 rounded"
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
        ))}
        {missingData.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No missing serial numbers</div>
        )}
      </CardContent>
    </Card>
  )
}

