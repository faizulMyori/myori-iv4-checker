"use client"

import { Button } from "@/components/ui/button"
import { useProduction } from "../context/production-context"
import ProductionDialog from "./production-dialog"
import React from "react"

export default function ProductionControls() {
  const {
    productionStatus,
    savedProduction,
    startProduction,
    holdProduction,
    resumeProduction,
    stopProduction,
    handleDownload,
    resetProduction,
  } = useProduction()

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        <ProductionDialog />
        <Button
          size="lg"
          className="bg-green-700 hover:bg-green-600"
          disabled={!savedProduction || productionStatus === "RUNNING" || productionStatus === "HOLD"}
          onClick={startProduction}
        >
          Start Production
        </Button>
        {productionStatus === "HOLD" ? (
          <Button size="lg" className="bg-amber-600 hover:bg-amber-500" onClick={resumeProduction}>
            Resume Production
          </Button>
        ) : (
          <Button
            size="lg"
            className="bg-amber-600 hover:bg-amber-500"
            disabled={productionStatus !== "RUNNING"}
            onClick={holdProduction}
          >
            Hold Production
          </Button>
        )}
        <Button
          size="lg"
          className="bg-slate-700 hover:bg-slate-600"
          disabled={productionStatus !== "RUNNING" && productionStatus !== "HOLD"}
          onClick={stopProduction}
        >
          Stop Production
        </Button>
        <Button
          size="lg"
          className="bg-slate-700 hover:bg-slate-600"
          disabled={productionStatus === "RUNNING"}
          onClick={() => handleDownload("all")}
        >
          Download Reports
        </Button>
        <Button
          size="lg"
          className="bg-red-700 hover:bg-red-600"
          disabled={productionStatus === "RUNNING" || productionStatus === "HOLD"}
          onClick={resetProduction}
        >
          Reset Production
        </Button>
      </div>
      <div
        className={`text-lg font-semibold ${productionStatus === "RUNNING"
          ? "text-green-500"
          : productionStatus === "STOPPED"
            ? "text-red-500"
            : productionStatus === "HOLD"
              ? "text-amber-500"
              : "text-gray-500"
          }`}
      >
        Status: {productionStatus}
      </div>
    </div>
  )
}

