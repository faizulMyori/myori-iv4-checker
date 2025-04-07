"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProduction } from "../context/production-context"
import React from "react"

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
      <CardContent className="h-[200px] overflow-y-auto">
        {[...(unusedSerials || [])].reverse().map((item: string, index: number) => (
          <div key={index} className="text-sm text-red-500">
            {`${item}`}
          </div>
        ))}
        {unusedSerials.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No unused serial numbers</div>
        )}
      </CardContent>
    </Card>
  )
}

