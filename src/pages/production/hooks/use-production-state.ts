"use client"

import { useState, useEffect } from "react"

export function useProductionState(setProdStatus: any, conn: string) {
  const [productionStatus, setProductionStatus] = useState<"IDLE" | "RUNNING" | "STOPPED" | "HOLD">("IDLE")
  const [userHold, setUserHold] = useState(false)

  // Start production
  const startProduction = () => {
    setProdStatus("started")
    setProductionStatus("RUNNING")
    setUserHold(false)
  }

  // Hold production
  const holdProduction = () => {
    setProdStatus("hold")
    setProductionStatus("HOLD")
    setUserHold(true)
  }

  // Resume production from hold
  const resumeProduction = () => {
    if (conn !== "connected") {
      setProdStatus("hold")
      setProductionStatus("HOLD")
    } else {
      setProdStatus("started")
      setProductionStatus("RUNNING")
      setUserHold(false)
    }
  }

  // Stop production
  const stopProduction = () => {
    setProdStatus("stopped")
    setProductionStatus("STOPPED")
    setUserHold(false)
  }

  // Monitor connection status
  useEffect(() => {
    if (conn !== "connected" && productionStatus === "RUNNING") {
      setProdStatus("hold")
      setProductionStatus("HOLD")
      setUserHold(false) // system hold
    } else if (conn === "connected" && productionStatus === "HOLD" && !userHold) {
      setProdStatus("RUNNING")
      setProductionStatus("RUNNING")
    }
  }, [conn, productionStatus, setProdStatus, userHold])

  return {
    productionStatus,
    setProductionStatus,
    startProduction,
    holdProduction,
    resumeProduction,
    stopProduction,
  }
}
