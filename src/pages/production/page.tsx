"use client"

import { useContext, useState, useEffect, useCallback } from "react"
import { UserContext } from "@/App"
import Footer from "@/components/template/Footer"
import ProductionControls from "./components/production-controls"
import ProductionData from "./components/production-data"
import CapturedData from "./components/captured-data"
import UnusedSerials from "./components/unused-serials"
import MissingData from "./components/missing-data"
import DuplicatedData from "./components/duplicated-data"
import ManualRejectData from "./components/manual-reject-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProductionState } from "./hooks/use-production-state"
import { useLabelRolls } from "./hooks/use-label-rolls"
import { useProductionSetup } from "./hooks/use-production-setup"
import { useReportDownload } from "./hooks/use-report-download"
import { ProductionProvider } from "./context/production-context"
import { toast } from "sonner"
import React from "react"
import { RestartDialog } from "./components/restart-dialog"

export default function ProductionPage() {
  const { prodStatus, setProdStatus, conn }: any = useContext(UserContext)

  // Initialize all the hooks and state
  const { productionStatus, setProductionStatus, startProduction, holdProduction, resumeProduction } =
    useProductionState(setProdStatus, conn)

  // // Monitor TCP connection status
  // useEffect(() => {
  //   if (productionStatus !== "RUNNING") return;
  //   window.tcpConnection.tcp_closed(handleTcpClosed);
  // }, [productionStatus]);

  // const handleTcpClosed = useCallback(() => {
  //   if (productionStatus === "RUNNING") {
  //     window.serial.serial_com_send("@0101\r");
  //   }
  // }, [productionStatus]);

  const { labelRolls, addLabelRoll, updateLabelRoll, verifyLabelRoll, calculateTotalLabels, setLabelRolls } = useLabelRolls()

  const [capturedData, setCapturedData] = useState<any[]>([])
  const [duplicatedData, setDuplicatedData] = useState<any[]>([])
  const [missingData, setMissingData] = useState<any[]>([])
  const [unusedSerials, setUnusedSerials] = useState<string[]>([])

  const {
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
    handleOpenChange,
    saveProduction,
    checkDuplicates,
    setCheckDuplicates,
  } = useProductionSetup(labelRolls, calculateTotalLabels)

  const {
    manualRejectEntries,
    setManualRejectEntries,
    isManualRejectModalOpen,
    setIsManualRejectModalOpen,
    newSerialNumbers,
    setNewSerialNumbers,
    handleSerialNumberChange,
    handleAddSerialNumberField,
    handleRemoveSerialNumberField,
    addManualRejectEntries,
    handleDeleteEntry,
  } = useManualReject()

  const { handleDownload, isSavePathModalOpen, setIsSavePathModalOpen, savePath, handleConfirmDownload, isRestartDialogOpen, setIsRestartDialogOpen, handleRestartConfirm } = useReportDownload(
    capturedData,
    missingData,
    duplicatedData,
    manualRejectEntries,
    batchNo,
    productData,
    unusedSerials,
  )

  // Handle TCP data capture
  useEffect(() => {
    if (productionStatus !== "RUNNING") {
      return () => {
        window.tcpConnection.tcp_received(undefined) // Properly remove listener
      }
    }

    const handleTcpData = async (data: any) => {
      const [serial, url, status] = data.split(",").map((data: string) => data.trim())
      console.log("Received Data:", labelRolls)

      if (productionStatus !== "RUNNING") return

      const newUrl = new Date().toLocaleTimeString()

      setCapturedData((prevData) => {
        if (prevData.length > 0) {
          const lastEntry = prevData[prevData.length - 1]
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/)

          if (match) {
            const prefix = match[1]
            const lastSerialNum = Number.parseInt(match[2], 10)
            const numLength = match[2].length

            const currentMatch = serial.match(/^([A-Za-z]+)(\d+)$/)
            if (currentMatch) {
              const currentPrefix = currentMatch[1]
              const currentSerialNum = Number.parseInt(currentMatch[2], 10)

              // 🛑 Find matching rollInfo by prefix
              const matchedRoll = labelRolls.find(info => {
                const startPrefix = info.startNumber.match(/^([A-Za-z]+)/)?.[1]
                return startPrefix === currentPrefix
              })

              if (matchedRoll) {
                const endMatch = matchedRoll.endNumber.match(/^([A-Za-z]+)(\d+)$/)
                if (endMatch) {
                  const endSerialNum = Number.parseInt(endMatch[2], 10)

                  // 🔥 Check OOR
                  if (currentSerialNum > endSerialNum) {
                    // setMissingData((prevMissing) => [
                    //   ...prevMissing,
                    //   { serial, url: newUrl, status: "OOR" },
                    // ])
                  }
                  // 🔥 Normal missing
                  else if (currentSerialNum > lastSerialNum + 1) {
                    window.serial.serial_com_send("@0101\r");
                    for (let i = lastSerialNum + 1; i < currentSerialNum; i++) {
                      const skippedSerial = `${prefix}${String(i).padStart(numLength, "0")}`
                      setMissingData((prevMissing) => [
                        ...prevMissing,
                        { serial: skippedSerial, url: newUrl, status: "MISSING" },
                      ])
                    }
                  }
                }
              } else {
                // 🛑 If no matching roll found, you can optionally handle it here
                console.warn('No matching rollInfo for serial prefix:', currentPrefix)
              }
            }
          }
        }

        return prevData
      })

      if (!status) {
        setMissingData((prevMissing) => [...prevMissing, { serial, url: "", status: "(UNKNOWN)" }])
        return
      }

      // Handle case where serial or url is missing
      if (!serial || !url) {
        setMissingData((prev) => [...prev, { serial: serial || "", url: newUrl || "", status }]);
        return;
      }

      if (status === "NG") {
        setMissingData(prevMissing => [...prevMissing, { serial, url: newUrl, status }]);
        return;
      }

      // Validate serial number
      const serialPrefix = serial.replace(/\d/g, "")
      const serialNum = Number.parseInt(serial.replace(/\D/g, ""), 10)
      const isValidSerial = labelRolls.some(({ startNumber, endNumber }: any) => {
        if (!startNumber || !endNumber) return false

        const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/)
        const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/)
        if (!startMatch || !endMatch) return false

        const startPrefix = startMatch[1]
        const endPrefix = endMatch[1]
        if (startPrefix !== endPrefix || startPrefix !== serialPrefix) return false

        const start = Number.parseInt(startMatch[2], 10)
        const end = Number.parseInt(endMatch[2], 10)

        return serialNum >= start && serialNum <= end
      })

      if (!isValidSerial) {
        const newEntry = { serial, url: newUrl, status: status + " - (INVALID)" }

        setMissingData((prevMissing) => {
          // if (prevMissing.some((entry) => entry.serial === newEntry.serial && entry.status === 'OOR')) {
          //   return prevMissing
          // }
          const newMissing = [...prevMissing, newEntry]
          return newMissing
        })
        return
      }

      // Check if serial is already captured (duplicate)
      let alreadyCaptured = false

      alreadyCaptured = capturedData.some((entry) => entry.serial === serial)

      if (alreadyCaptured && checkDuplicates) {
        // Add to duplicated data, not captured data
        setDuplicatedData((prevDuplicates) => {
          if (!prevDuplicates.some((dup) => dup.serial === serial)) {
            // Add to duplicated data
            const newDuplicates = [...prevDuplicates, { serial, url: newUrl, status }]
            return newDuplicates
          }
          return prevDuplicates
        })

        window.serial.serial_com_send("@0102\r")
        return
      } else if (alreadyCaptured && !checkDuplicates) {
        return
      }

      // Only add to captured data if status is OK and not a duplicate
      if (status === "OK" && !alreadyCaptured) {
        // Remove from unused serials when captured
        removeFromUnusedSerials(serial)

        // Insert into database immediately
        window.sqlite.create_label({
          batch_id: batchID,
          serial: serial,
          qr_code: newUrl,
          status: status,
        })

        setCapturedData((prevData) => {
          // Step 1: Create new array with new item
          const newData = [...prevData, { serial, url: newUrl, status }]
          setMissingData((prevMissing) => prevMissing.filter((item) => item.serial !== serial))
          // Step 2: Sort by serial number
          newData.sort((a, b) => {
            const matchA = a.serial.match(/^([A-Za-z]+)(\d+)$/)
            const matchB = b.serial.match(/^([A-Za-z]+)(\d+)$/)

            if (matchA && matchB) {
              const prefixA = matchA[1]
              const prefixB = matchB[1]
              const numberA = Number(matchA[2])
              const numberB = Number(matchB[2])

              if (prefixA !== prefixB) {
                return prefixA.localeCompare(prefixB)
              }
              return numberA - numberB
            }

            return 0 // if match failed, keep original order
          })

          return newData
        })
      }
    }

    window.tcpConnection.tcp_received(handleTcpData)

    return () => {
      window.tcpConnection.tcp_received(undefined) // Properly remove listener
    }
  }, [productionStatus, labelRolls, manualRejectEntries, capturedData, checkDuplicates, batchID])

  // Stop production without saving data to database
  const stopProduction = () => {
    setProdStatus("stopped")
    setProductionStatus("STOPPED")
    toast.success("Production stopped successfully")
  }

  // Generate all possible serials from label rolls
  const generateAllSerials = () => {
    return labelRolls.flatMap(({ startNumber, endNumber }: any) => {
      if (!startNumber || !endNumber) return []

      const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/)
      const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/)

      if (!startMatch || !endMatch) return [] // Skip if format is invalid

      const prefix = startMatch[1]
      const numLength = startMatch[2].length
      const start = Number.parseInt(startMatch[2], 10)
      const end = Number.parseInt(endMatch[2], 10)

      return isNaN(start) || isNaN(end) || start > end
        ? [] // Ensure valid range
        : Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${String(start + i).padStart(numLength, "0")}`)
    })
  }

  // Initialize unused serials when label rolls change
  useEffect(() => {
    if (labelRolls.some((roll: any) => roll.verified)) {
      const allSerials = generateAllSerials()
      setUnusedSerials(allSerials)
      console.log("Initialized unused serials:", allSerials.length)
    } else {
      setUnusedSerials([])
    }
  }, [labelRolls])

  // Handle removing a serial from unused serials
  const removeFromUnusedSerials = (serial: string) => {
    if (!serial) return
    setUnusedSerials((prev) => {
      const newUnused = prev.filter((s) => s !== serial)
      console.log(`Removed ${serial} from unused serials. Remaining: ${newUnused.length}`)
      return newUnused
    })
  }

  // Handle adding a serial back to unused serials
  const addToUnusedSerials = (serial: string) => {
    if (!serial) return
    console.log(serial)
    // Check if the serial is in captured data
    const isInCapturedData = capturedData.some((item) => item.serial === serial)

    if (isInCapturedData && !serial.includes(":")) {
      console.log(`Serial ${serial} is in captured data, not adding to unused serials`)
      return
    }

    // Only add if it's not already in the list
    setUnusedSerials((prev) => {
      if (!prev.includes(serial)) {
        if (serial.includes(":")) {
          const newUnused = [serial.replace(":", ""), ...prev]
          console.log(`Added ${serial} back to unused serials. Total: ${newUnused.length}`)
          return newUnused
        } else {
          const newUnused = [serial, ...prev]
          console.log(`Added ${serial} back to unused serials. Total: ${newUnused.length}`)
          return newUnused
        }
      }
      return prev
    })
  }

  // Handle removing a missing data entry
  const handleRemoveMissingEntry = (i: Number) => {
    setMissingData((prevData) => {
      return prevData.reverse().filter((item, index) => index !== i).reverse()
    })
  }

  // Handle removing a captured data entry and delete from database
  const handleDeleteCapturedData = async (serial: string) => {
    console.log(serial)
    try {
      // Delete from database
      await window.sqlite.delete_label(serial)
      // Remove from capturedData state
      setCapturedData((prevData) => {
        const newData = prevData.filter((item) => item.serial !== serial)
        console.log(`Removed ${serial} from captured data. Remaining: ${newData.length}`)
        return newData
      })
      // Add back to unused serials
      addToUnusedSerials(serial)
      toast.success(`Serial ${serial} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting serial ${serial}:`, error)
      toast.error(`Error deleting serial ${serial}`)
    }
  }

  // Handle removing a duplicated data entry
  const handleRemoveDuplicatedEntry = (serial: string) => {
    setDuplicatedData((prevData) => {
      console.log(`Removing ${serial} from duplicated data`)
      return prevData.filter((item) => item.serial !== serial)
    })

    // Check if the serial is in captured data before adding back to unused serials
    const isInCapturedData = capturedData.some((item) => item.serial === serial)

    if (isInCapturedData) {
      console.log(`Serial ${serial} is in captured data, not adding to unused serials`)
      return
    }

    // Add back to unused serials only if not in captured data
    addToUnusedSerials(serial)
  }

  // Add a function to check for duplicated data across label rolls
  const checkForDuplicatedRolls = () => {
    const allSerials = new Set<string>()
    const duplicates = new Set<string>()

    // Check for duplicates within the label rolls
    labelRolls.forEach(({ startNumber, endNumber }: any) => {
      if (!startNumber || !endNumber) return

      const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/)
      const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/)

      if (!startMatch || !endMatch) return

      const prefix = startMatch[1]
      const numLength = startMatch[2].length
      const start = Number.parseInt(startMatch[2], 10)
      const end = Number.parseInt(endMatch[2], 10)

      if (isNaN(start) || isNaN(end) || start > end) return

      for (let i = start; i <= end; i++) {
        const serial = `${prefix}${String(i).padStart(numLength, "0")}`

        if (allSerials.has(serial)) {
          duplicates.add(serial)
        } else {
          allSerials.add(serial)
        }
      }
    })

    return Array.from(duplicates)
  }

  // Create the production context value
  const productionContextValue = {
    savedProduction,
    setSavedProduction,
    calculateTotalLabels,
    productData,
    setProductData,
    open,
    handleOpenChange,
    productionStatus,
    today: new Date().toISOString().split("T")[0],
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
    labelRolls,
    setLabelRolls,
    addLabelRoll,
    updateLabelRoll,
    verifyLabelRoll,
    saveProduction,
    checkDuplicates,
    setCheckDuplicates,
    checkForDuplicatedRolls: () => {
      // Implementation of checkForDuplicatedRolls
    },
    capturedData,
    setCapturedData,
    missingData,
    setMissingData,
    handleRemoveMissingEntry,
    duplicatedData,
    setDuplicatedData,
    handleRemoveDuplicatedEntry,
    manualRejectEntries,
    setManualRejectEntries,
    isManualRejectModalOpen,
    setIsManualRejectModalOpen,
    newSerialNumbers,
    handleSerialNumberChange,
    handleAddSerialNumberField,
    handleRemoveSerialNumberField,
    addManualRejectEntries,
    handleDeleteEntry,
    handleDownload,
    handleDeleteCapturedData,
    resetProduction: () => {
      // Reset all state to initial values
      setSavedProduction(null)
      setProductData({ id: "", sku: "", brand: "", model: "", type: "", rating: "", size: "" })
      setBatchNo("")
      setShiftNo("")
      setBatchError(false)
      setSelectedProduct("")
      setLabelRolls([{ id: "1", rollNumber: "1", startNumber: "", endNumber: "", verified: false }])
      setCheckDuplicates(false)
      setCapturedData([])
      setMissingData([])
      setDuplicatedData([])
      setManualRejectEntries([])
      setNewSerialNumbers([""])
      setIsManualRejectModalOpen(false)
      setUnusedSerials([])
    },
    startProduction,
    holdProduction,
    resumeProduction,
    stopProduction,
    unusedSerials,
    setUnusedSerials,
    removeFromUnusedSerials,
    addToUnusedSerials,
    isSavePathModalOpen,
    setIsSavePathModalOpen,
    savePath,
    handleConfirmDownload,
    isRestartDialogOpen,
    setIsRestartDialogOpen,
    handleRestartConfirm
  }

  return (
    <ProductionProvider value={productionContextValue}>
      <div className="flex h-full flex-col p-4 overflow-y-auto scrollbar w-full">
        <div className="flex flex-1 flex-col gap-2 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Production</h2>
          </div>
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Management</CardTitle>
                <CardDescription>Manage and monitor production batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Control Buttons */}
                  <ProductionControls />

                  {/* Production Data Display */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Production Data */}
                    <ProductionData />

                    {/* Reading Captured Data */}
                    <CapturedData />

                    {/* Auto-Reject Data */}
                    <UnusedSerials />

                    {/* Bottom Row */}
                    <MissingData />
                    <DuplicatedData />
                    <ManualRejectData />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <RestartDialog
          isOpen={isRestartDialogOpen}
          onOpenChange={setIsRestartDialogOpen}
          onConfirm={handleRestartConfirm}
        />
      </div>
    </ProductionProvider>
  )
}

function useManualReject() {
  const [manualRejectEntries, setManualRejectEntries] = useState<{ id: string; serialNumber: string }[]>([])
  const [isManualRejectModalOpen, setIsManualRejectModalOpen] = useState(false)
  const [newSerialNumbers, setNewSerialNumbers] = useState([""]) // Start with an empty field

  const handleSerialNumberChange = (index: number, value: string) => {
    const updatedSerialNumbers = [...newSerialNumbers]
    updatedSerialNumbers[index] = value
    setNewSerialNumbers(updatedSerialNumbers)
  }

  const handleAddSerialNumberField = () => {
    setNewSerialNumbers((prev) => [...prev, ""])
  }

  const handleRemoveSerialNumberField = (index: number) => {
    const updatedSerialNumbers = newSerialNumbers.filter((_, i) => i !== index)
    setNewSerialNumbers(updatedSerialNumbers)
  }

  const addManualRejectEntries = () => {
    const validEntries = newSerialNumbers.filter((serialNumber) => serialNumber.trim() !== "")

    if (validEntries.length > 0) {
      setManualRejectEntries((prevEntries) => [
        ...prevEntries,
        ...validEntries.map((serialNumber) => ({
          id: Date.now() + Math.random().toString(), // Use a unique ID for each entry
          serialNumber,
        })),
      ])
      setNewSerialNumbers([""]) // Reset the serial number fields
      setIsManualRejectModalOpen(false)
    }
  }

  const handleDeleteEntry = (id: string) => {
    setManualRejectEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id))
  }

  return {
    manualRejectEntries,
    setManualRejectEntries,
    isManualRejectModalOpen,
    setIsManualRejectModalOpen,
    newSerialNumbers,
    setNewSerialNumbers,
    handleSerialNumberChange,
    handleAddSerialNumberField,
    handleRemoveSerialNumberField,
    addManualRejectEntries,
    handleDeleteEntry,
  }
}
