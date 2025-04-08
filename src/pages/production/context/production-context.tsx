"use client"

import { createContext, useContext, type ReactNode } from "react"
import React from "react";
// Create the context with a default value
export const ProductionContext = createContext<any>(null)

// Create a provider component
export function ProductionProvider({ children, value }: { children: ReactNode; value: any }) {
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

