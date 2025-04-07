"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useProduction } from "../context/production-context"
import React from "react"

export default function ProductionData() {
  const { savedProduction, calculateTotalLabels } = useProduction()

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">PRODUCTION DATA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {savedProduction ? (
          <>
            <div>
              <Label>Production Date:</Label>
              <div>{savedProduction.date}</div>
            </div>
            <div>
              <Label>Brand - Model:</Label>
              <div>{savedProduction.product}</div>
            </div>
            <div>
              <Label>Batch No.</Label>
              <div>{savedProduction.batchNo}</div>
            </div>
            <div>
              <Label>Labels Qty:</Label>
              <div>{calculateTotalLabels().toLocaleString()}</div>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground">No production data</div>
        )}
      </CardContent>
    </Card>
  )
}

