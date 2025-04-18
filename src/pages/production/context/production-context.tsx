"use client"

import { createContext, useContext, type ReactNode } from "react"
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

interface CapturedData {
  serial: string
  url: string
  status: string
}

interface MissingData {
  serial: string
  url: string
  status: string
}

interface ProductionContextType {
  savedProduction: ProductionData | null
  setSavedProduction: React.Dispatch<React.SetStateAction<ProductionData | null>>
  calculateTotalLabels: () => number
  productData: ProductData
  setProductData: React.Dispatch<React.SetStateAction<ProductData>>
  open: boolean
  handleOpenChange: (isOpen: boolean) => void
  productionStatus: string
  today: string
  batchNo: string
  setBatchNo: (value: string) => void
  shiftNo: string
  setShiftNo: (value: string) => void
  batches: any[]
  batchError: boolean
  setBatchError: (value: boolean) => void
  selectedProduct: string
  setSelectedProduct: (value: string) => void
  products: any[]
  loading: boolean
  labelRolls: LabelRoll[]
  setLabelRolls: React.Dispatch<React.SetStateAction<LabelRoll[]>>
  addLabelRoll: () => void
  updateLabelRoll: (id: string, field: keyof LabelRoll, value: string | boolean) => void
  verifyLabelRoll: (id: string) => void
  saveProduction: () => void
  checkDuplicates: boolean
  setCheckDuplicates: (value: boolean) => void
  checkForDuplicatedRolls: () => void
  capturedData: CapturedData[]
  setCapturedData: React.Dispatch<React.SetStateAction<CapturedData[]>>
  missingData: MissingData[]
  setMissingData: React.Dispatch<React.SetStateAction<MissingData[]>>
  handleRemoveMissingEntry: (index: number) => void
  duplicatedData: CapturedData[]
  setDuplicatedData: React.Dispatch<React.SetStateAction<CapturedData[]>>
  handleRemoveDuplicatedEntry: (serial: string) => void
  manualRejectEntries: { id: string; serialNumber: string }[]
  setManualRejectEntries: React.Dispatch<React.SetStateAction<{ id: string; serialNumber: string }[]>>
  isManualRejectModalOpen: boolean
  setIsManualRejectModalOpen: (value: boolean) => void
  newSerialNumbers: string[]
  handleSerialNumberChange: (index: number, value: string) => void
  handleAddSerialNumberField: () => void
  handleRemoveSerialNumberField: (index: number) => void
  addManualRejectEntries: () => void
  handleDeleteEntry: (id: string) => void
  handleDownload: (section: string, isRestart?: boolean) => void
  handleDeleteCapturedData: (serial: string) => void
  resetProduction: () => void
  startProduction: () => void
  holdProduction: () => void
  resumeProduction: () => void
  stopProduction: () => void
  unusedSerials: string[]
  setUnusedSerials: React.Dispatch<React.SetStateAction<string[]>>
  removeFromUnusedSerials: (serial: string) => void
  addToUnusedSerials: (serial: string) => void
  isSavePathModalOpen: boolean
  setIsSavePathModalOpen: (value: boolean) => void
  savePath: string
  handleConfirmDownload: () => void
  isRestartDialogOpen: boolean
  setIsRestartDialogOpen: (value: boolean) => void
  handleRestartConfirm: () => void
}

// Create the context with a default value
export const ProductionContext = createContext<ProductionContextType | null>(null)

// Create a provider component
export function ProductionProvider({ children, value }: { children: ReactNode; value: ProductionContextType }) {
  return <ProductionContext.Provider value={value}>{children}</ProductionContext.Provider>
}

// Create a hook to use the context
export function useProduction() {
  const context = useContext(ProductionContext)
  if (context === null) {
    throw new Error("useProduction must be used within a ProductionProvider")
  }
  return context
}

