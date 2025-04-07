"use client"

import { useState, useEffect } from "react"
import type { LabelRoll } from "./use-label-rolls"

type ProductionData = {
  date: string
  batchNo: string
  product: string
  labelRolls: LabelRoll[]
}

export function useProductionSetup(labelRolls: LabelRoll[], calculateTotalLabels: () => number) {
  const [open, setOpen] = useState(false)
  const [batchID, setBatchID] = useState("")
  const [batchNo, setBatchNo] = useState("")
  const [shiftNo, setShiftNo] = useState("")
  const [batches, setBatches] = useState<any[]>([])
  const [batchError, setBatchError] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [savedProduction, setSavedProduction] = useState<ProductionData | null>(null)
  const [productData, setProductData] = useState({
    id: "",
    sku: "",
    brand: "",
    model: "",
    type: "",
    rating: "",
    size: "",
  })

  // Get today's date formatted
  const today = new Date().toISOString().split("T")[0]

  // Load batches on mount
  useEffect(() => {
    window.sqlite.get_batchs().then((data: any) => {
      console.log(data)
      setBatches(data)
    })
  }, [])

  // Load products when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && products.length === 0) {
      setLoading(true)
      try {
        window.sqlite.get_products().then((data: any) => {
          console.log(data)
          setProducts(data)
        })
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  // Save production data
  const saveProduction = () => {
    const productData = {
      date: today,
      batchNo,
      shiftNo: shiftNo,
      product: selectedProduct,
      labelRolls,
    }

    setProductData({
      id: selectedProduct,
      sku: products.find((p: any) => p.id.toString() === selectedProduct)?.sku,
      brand: products.find((p: any) => p.id.toString() === selectedProduct)?.brand,
      model: products.find((p: any) => p.id.toString() === selectedProduct)?.model,
      type: products.find((p: any) => p.id.toString() === selectedProduct)?.type,
      rating: products.find((p: any) => p.id.toString() === selectedProduct)?.rating,
      size: products.find((p: any) => p.id.toString() === selectedProduct)?.size,
    })
    setSavedProduction(productData)
    window.sqlite
      .create_batch({
        date: today,
        batch_no: batchNo,
        product_id: selectedProduct,
        shift_number: shiftNo,
      })
      .then((data: any) => {
        setBatchID(data?.id)
      })
      .catch((error: any) => {
        console.log(error)
      })
    setOpen(false)
  }

  return {
    open,
    setOpen,
    batchID,
    setBatchID,
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
    savedProduction,
    setSavedProduction,
    productData,
    setProductData,
    today,
    handleOpenChange,
    saveProduction,
  }
}

