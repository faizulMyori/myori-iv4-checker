"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useProduction } from "../context/production-context"
import { useContext } from "react"
import { UserContext } from "@/App"
import React from "react"
import type { LabelRoll } from "../hooks/use-label-rolls"

interface ProductionData {
  date: string
  batchNo: string
  product: string
  labelRolls: LabelRoll[]
}

interface ProductData {
  id: string
  sku: string
  brand: string
  model: string
  type: string
  rating: string
  size: string
}

export default function ProductionData() {
  const { savedProduction, calculateTotalLabels, setSavedProduction, productData, setProductData } = useProduction()
  const userContext = useContext(UserContext)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedData, setEditedData] = React.useState<ProductionData | null>(savedProduction)
  const [editedProductData, setEditedProductData] = React.useState<ProductData>(productData)

  React.useEffect(() => {
    setEditedData(savedProduction)
    setEditedProductData(productData)
  }, [savedProduction, productData])

  const handleInputChange = (field: keyof ProductionData, value: string) => {
    if (editedData) {
      setEditedData(prev => ({
        ...prev!,
        [field]: value
      }))
    }
  }

  const handleProductDataChange = (field: keyof ProductData, value: string) => {
    setEditedProductData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    if (setSavedProduction && setProductData && editedData) {
      setSavedProduction(editedData)
      setProductData(editedProductData)
      setIsEditing(false)
    }
  }

  const canEdit = userContext?.prodStatus === "stopped"

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">PRODUCTION DATA</CardTitle>
        {/* {canEdit && (
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        )} */}
      </CardHeader>
      <CardContent className="space-y-2">
        {savedProduction ? (
          <>
            <div>
              <Label>Production Date:</Label>
              {isEditing ? (
                <Input
                  value={editedData?.date || ""}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div>{savedProduction.date}</div>
              )}
            </div>
            <div>
              <Label>Brand - Model:</Label>
              {isEditing ? (
                <Input
                  value={editedProductData.brand + " - " + editedProductData.model}
                  onChange={(e) => {
                    const [brand, model] = e.target.value.split(" - ")
                    handleProductDataChange("brand", brand)
                    handleProductDataChange("model", model)
                  }}
                  className="mt-1"
                />
              ) : (
                <div>{productData.brand} - {productData.model}</div>
              )}
            </div>
            <div>
              <Label>Batch No.</Label>
              {isEditing ? (
                <Input
                  value={editedData?.batchNo || ""}
                  onChange={(e) => handleInputChange("batchNo", e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div>{savedProduction.batchNo}</div>
              )}
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

