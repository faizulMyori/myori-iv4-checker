"use client"

import { Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useProduction } from "../context/production-context"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import React from "react"

export default function ProductionDialog() {
  const {
    open,
    handleOpenChange,
    productionStatus,
    today,
    batchNo,
    setBatchNo,
    shiftNo,
    setShiftNo,
    batches,
    batchError,
    setBatchError,
    selectedProduct,
    setSelectedProduct,
    products,
    loading,
    setProductData,
    labelRolls,
    addLabelRoll,
    updateLabelRoll,
    verifyLabelRoll,
    calculateTotalLabels,
    saveProduction,
    checkDuplicates,
    setCheckDuplicates,
    checkForDuplicatedRolls,
  } = useProduction()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg">
          New Production
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Production Batch</DialogTitle>
          <DialogDescription>Enter the production details and label roll information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productionDate" className="text-right">
              Production Date
            </Label>
            <Input id="productionDate" value={new Date().toISOString().split("T")[0]} readOnly className="col-span-3 bg-muted" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="batchNo" className="text-right">
              Batch No.
            </Label>
            <Input
              id="batchNo"
              value={batchNo}
              disabled={productionStatus === "RUNNING"}
              onChange={(e) => setBatchNo(e.target.value)}
              className={`col-span-3 ${batchError ? "border-red-500" : ""}`}
              placeholder="Enter batch number"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shiftNo" className="text-right">
              Shift No.
            </Label>
            <Input
              id="shiftNo"
              value={shiftNo}
              disabled={productionStatus === "RUNNING"}
              onChange={(e) => {
                setShiftNo(e.target.value)
                if (batches.find((batch: any) => batch.shift_number === e.target.value && batch.batch_no === batchNo)) {
                  setBatchError(true)
                } else {
                  setBatchError(false)
                }
              }}
              className={`col-span-3 ${batchError ? "border-red-500" : ""}`}
              placeholder="Enter shift number"
            />
            {batchError && (
              <div className="text-right text-xs col-span-4 text-red-500">{"Shift number already exists"}</div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Product
            </Label>
            <div className="col-span-3">
              <Select
                disabled={productionStatus === "RUNNING"}
                value={selectedProduct}
                onValueChange={(value) => {
                  setSelectedProduct(value)
                  setProductData(products.find((product: any) => product.id.toString() === value) || {})
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Loading products...
                    </SelectItem>
                  ) : (
                    products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.sku} - {product.model}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <Label>Label Rolls</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={productionStatus === "RUNNING"}
                onClick={addLabelRoll}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Roll
              </Button>
            </div>

            {labelRolls.map((roll: any) => (
              <div key={roll.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                <div className="col-span-3">
                  <Input
                    placeholder="Roll #"
                    value={roll.rollNumber}
                    readOnly
                    className="bg-muted"
                    disabled={roll.verified}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="Start #"
                    value={roll.startNumber}
                    onChange={(e) => updateLabelRoll(roll.id, "startNumber", e.target.value)}
                    disabled={roll.verified}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="End #"
                    value={roll.endNumber}
                    onChange={(e) => updateLabelRoll(roll.id, "endNumber", e.target.value)}
                    disabled={roll.verified}
                  />
                </div>
                <div className="col-span-3 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant={roll.verified ? "default" : "outline"}
                    onClick={() => verifyLabelRoll(roll.id)}
                    disabled={roll.verified}
                  >
                    <Check className="h-4 w-4" />
                    {roll.verified ? "Verified" : "Check"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const duplicates = checkForDuplicatedRolls()
                if (duplicates.length > 0) {
                  toast.error(`Found ${duplicates.length} duplicate serial numbers across rolls`, {
                    description: `First few duplicates: ${duplicates.slice(0, 3).join(", ")}${duplicates.length > 3 ? "..." : ""}`,
                    duration: 5000,
                  })
                } else {
                  toast.success("No duplicate serial numbers found across rolls", {
                    duration: 3000,
                  })
                }
              }}
              disabled={!labelRolls.some((roll: any) => roll.verified) || productionStatus === "RUNNING"}
            >
              Check for Duplicates Across Rolls
            </Button>
          </div> */}

          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="check-duplicates" className="font-semibold">
                  Check for Duplicated Data
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, the system will check for and flag duplicate serial numbers
                </p>
              </div>
              <Switch
                id="check-duplicates"
                checked={checkDuplicates}
                onCheckedChange={setCheckDuplicates}
                disabled={productionStatus === "RUNNING"}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <Label className="text-right font-semibold">Estimated Total Labels:</Label>
            <div className="col-span-3 font-bold text-lg">{calculateTotalLabels().toLocaleString()}</div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={saveProduction}
            disabled={productionStatus === "RUNNING" || labelRolls.some((roll: any) => !roll.verified) || batchError}
          >
            Save Production Batch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
