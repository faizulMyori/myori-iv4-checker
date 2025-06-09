"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduction } from "../context/production-context"
import React from "react"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"

export default function UnusedSerials() {
  const { unusedSerials = [], handleDownload } = useProduction()

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">UNUSED SERIAL NO</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{unusedSerials.length}</div>
          <Button variant="ghost" size="sm" onClick={() => handleDownload("unused-serials")}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] p-0">
        {unusedSerials.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No unused serial numbers</div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={200}
                width={width}
                itemCount={unusedSerials.length}
                itemSize={30}
                itemData={unusedSerials}
              >
                {({ index, style, data }) => (
                  <div
                    key={index}
                    style={style}
                    className="text-sm text-red-500 px-4"
                  >
                    {data[index]}
                  </div>
                )}
              </List>
            )}
          </AutoSizer>
        )}
      </CardContent>
    </Card>
  )
}
