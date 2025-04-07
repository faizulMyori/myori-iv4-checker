"use client"

import { useState, useEffect } from "react"

export function useProductionState(setProdStatus: any, conn: string) {
  const [productionStatus, setProductionStatus] = useState<"IDLE" | "RUNNING" | "STOPPED" | "HOLD">("IDLE")

  // Start production
  const startProduction = () => {
    setProdStatus("started")
    setProductionStatus("RUNNING")
  }

  // Hold production
  const holdProduction = () => {
    setProdStatus("hold")
    setProductionStatus("HOLD")
  }

  // Resume production from hold
  const resumeProduction = () => {
    if (conn !== "connected") {
      setProdStatus("hold")
      setProductionStatus("HOLD")
    } else {
      setProdStatus("started")
      setProductionStatus("RUNNING")
    }
  }

  // Stop production
  const stopProduction = () => {
    setProdStatus("stopped")
    setProductionStatus("STOPPED")
  }

  // Monitor connection status
  useEffect(() => {
    if (conn !== "connected" && productionStatus === "RUNNING") {
      setProdStatus("hold")
      setProductionStatus("HOLD")
    }
  }, [conn, productionStatus, setProdStatus])

  return {
    productionStatus,
    setProductionStatus,
    startProduction,
    holdProduction,
    resumeProduction,
    stopProduction,
  }
}

