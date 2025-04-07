"use client"

import { useContext, useEffect, useState } from "react"
import { Plus, Check, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Footer from "@/components/template/Footer"
import { UserContext } from "@/App"
import React from "react"

type LabelRoll = {
  id: string
  rollNumber: string
  startNumber: string
  endNumber: string
  verified: boolean
}

type ProductionData = {
  date: string
  batchNo: string
  product: string
  labelRolls: LabelRoll[]
}

type ManualRejectEntry = {
  id: string
  serialNumber: string
}

export default function ProductionPage() {
  const { prodStatus, setProdStatus, conn }: any = useContext(UserContext)

  const [capturedData, setCapturedData] = useState([] as any[])
  const [duplicatedData, setDuplicatedData] = useState([] as any[])
  const [missingData, setMissingData] = useState([] as any[])
  const [open, setOpen] = useState(false)
  const [batchID, setBatchID] = useState("")
  const [batchNo, setBatchNo] = useState("")
  const [shiftNo, setShiftNo] = useState("")
  const [batches, setBatches] = useState([])
  const [batchError, setBatchError] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [labelRolls, setLabelRolls] = useState<LabelRoll[]>([
    { id: "1", rollNumber: "1", startNumber: "", endNumber: "", verified: false },
  ])
  const [products, setProducts] = useState([] as any[])
  const [loading, setLoading] = useState(false)
  const [productionStatus, setProductionStatus] = useState<"IDLE" | "RUNNING" | "STOPPED" | "HOLD">("IDLE")
  const [savedProduction, setSavedProduction] = useState<ProductionData | null>(null)
  const [manualRejectEntries, setManualRejectEntries] = useState<ManualRejectEntry[]>([])
  const [isManualRejectModalOpen, setIsManualRejectModalOpen] = useState(false)
  const [newSerialNumber, setNewSerialNumber] = useState("")
  const [newSerialNumbers, setNewSerialNumbers] = useState([""]) // Start with an empty field
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

  // Calculate total labels
  const calculateTotalLabels = () => {
    return labelRolls.reduce((total, roll) => {
      if (roll.verified && roll.startNumber && roll.endNumber) {
        const startMatch = roll.startNumber.match(/^([A-Za-z]+)(\d+)$/)
        const endMatch = roll.endNumber.match(/^([A-Za-z]+)(\d+)$/)

        if (!startMatch || !endMatch) return total // Skip invalid format

        const startPrefix = startMatch[1]
        const endPrefix = endMatch[1]

        if (startPrefix !== endPrefix) return total // Ensure same prefix

        const start = Number.parseInt(startMatch[2], 10)
        const end = Number.parseInt(endMatch[2], 10)

        if (!isNaN(start) && !isNaN(end) && end >= start) {
          return total + (end - start + 1)
        }
      }
      return total
    }, 0)
  }

  useEffect(() => {
    window.sqlite.get_batchs().then((data: any) => {
      console.log(data)
      setBatches(data)
    })
  }, [])

  // Add new label roll
  const addLabelRoll = () => {
    const newRollNumber = (labelRolls.length + 1).toString()
    setLabelRolls([
      ...labelRolls,
      {
        id: newRollNumber,
        rollNumber: newRollNumber,
        startNumber: "",
        endNumber: "",
        verified: false,
      },
    ])
  }

  //create a function to loop infinitely and call requestOCRData every 5 seconds
  let receiveLoop: NodeJS.Timeout | null = null
  // const startReceiveLoop = () => {
  //   window.tcpConnection.tcp_start_receive(true)
  //   // receiveLoop = setTimeout(startReceiveLoop, 3000)
  // }

  // const stopReceive = () => {
  //   window.tcpConnection.tcp_start_receive(false)
  //   // if (receiveLoop) {
  //   //   clearTimeout(receiveLoop)
  //   //   receiveLoop = null
  //   // }
  // }

  // Edit label roll
  const updateLabelRoll = (id: string, field: keyof LabelRoll, value: string | boolean) => {
    setLabelRolls(labelRolls.map((roll) => (roll.id === id ? { ...roll, [field]: value } : roll)))
  }

  // Verify label roll
  const verifyLabelRoll = (id: string) => {
    const roll = labelRolls.find((r) => r.id === id)
    if (roll && roll.rollNumber && roll.startNumber && roll.endNumber) {
      const startMatch = roll.startNumber.match(/^([A-Za-z]+)(\d+)$/)
      const endMatch = roll.endNumber.match(/^([A-Za-z]+)(\d+)$/)

      if (!startMatch || !endMatch) return // Invalid format, skip

      const startPrefix = startMatch[1]
      const endPrefix = endMatch[1]

      if (startPrefix !== endPrefix) return // Ensure prefix consistency

      const start = Number.parseInt(startMatch[2], 10)
      const end = Number.parseInt(endMatch[2], 10)

      if (!isNaN(start) && !isNaN(end) && end >= start) {
        // Check if serial number exists from start to end in the database
        const startNumber = roll.startNumber
        const endNumber = roll.endNumber
        window.sqlite.check_serial_numbers({ startNumber, endNumber }).then((data: any) => {
          console.log(data)
          if (data.length === 0) {
            // Check for duplicate serial numbers in the list of label rolls
            const duplicate = labelRolls.some((r) => {
              if (r.id !== id) {
                // Skip the current roll
                const rStartMatch = r.startNumber.match(/^([A-Za-z]+)(\d+)$/)
                const rEndMatch = r.endNumber.match(/^([A-Za-z]+)(\d+)$/)
                if (rStartMatch && rEndMatch) {
                  const rStartPrefix = rStartMatch[1]
                  const rEndPrefix = rEndMatch[1]
                  const rStart = Number.parseInt(rStartMatch[2], 10)
                  const rEnd = Number.parseInt(rEndMatch[2], 10)

                  // Check if the prefix matches and if there is overlap in serial number ranges
                  if (startPrefix === rStartPrefix && endPrefix === rEndPrefix && start <= rEnd && end >= rStart) {
                    return true // Found overlapping or duplicate range with matching prefix
                  }
                }
              }
              return false
            })

            if (!duplicate) {
              updateLabelRoll(id, "verified", true)
            } else {
              window.electronWindow.info("Error", "Duplicate serial numbers found in the list of label rolls.")
            }
          }
        })
      }
    }
  }

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

  // Start production
  const startProduction = () => {
    setProdStatus("started")
    setProductionStatus("RUNNING")
    // reset all data except production data and revert label rolls
    setLabelRolls(labelRolls.map((roll) => ({ ...roll, verified: true })))
    setCapturedData([])
    setManualRejectEntries([])
    setDuplicatedData([])
    setNewSerialNumbers([])
    setMissingData([])
    // startReceiveLoop()
  }

  // Hold production
  const holdProduction = () => {
    setProdStatus("hold")
    setProductionStatus("HOLD")
    // stopReceive()
  }

  // Resume production from hold
  const resumeProduction = () => {
    if (conn !== "connected") {
      setProdStatus("hold")
      setProductionStatus("HOLD")
      // stopReceive()
    } else {
      setProdStatus("started")
      setProductionStatus("RUNNING")
      // startReceiveLoop()
    }
  }

  // Stop production
  const stopProduction = () => {
    setProdStatus("stopped")
    // stopReceive()

    setProductionStatus("STOPPED")
    if (labelRolls.length > 0) {
      capturedData.forEach((item: any) => {
        window.sqlite
          .create_label({
            batch_id: batchID,
            serial: item.serial,
            qr_code: item.url,
            status: item.status,
          })
          .then((data: any) => {
            console.log(data)
          })
          .catch((error: any) => {
            console.log(error)
          })
      })
    }
  }

  const handleSerialNumberChange = (index: any, value: any) => {
    const updatedSerialNumbers = [...newSerialNumbers]
    updatedSerialNumbers[index] = value
    setNewSerialNumbers(updatedSerialNumbers)
  }

  const handleAddSerialNumberField = () => {
    setNewSerialNumbers((prev) => [...prev, ""])
  }

  const handleRemoveSerialNumberField = (index: any) => {
    const updatedSerialNumbers = newSerialNumbers.filter((_, i) => i !== index)
    setNewSerialNumbers(updatedSerialNumbers)
  }

  const addManualRejectEntries = () => {
    const validEntries = newSerialNumbers.filter((serialNumber) => serialNumber.trim() !== "")

    if (validEntries.length > 0) {
      setManualRejectEntries((prevEntries: any) => [
        ...prevEntries,
        ...validEntries.map((serialNumber) => ({
          id: Date.now() + Math.random(), // Use a unique ID for each entry
          serialNumber,
        })),
      ])
      setNewSerialNumbers([""]) // Reset the serial number fields
      setIsManualRejectModalOpen(false)
    }
  }

  // const addManualRejectEntry = () => {
  //   if (newSerialNumber.trim()) {
  //     setManualRejectEntries([
  //       ...manualRejectEntries,
  //       { id: Date.now().toString(), serialNumber: newSerialNumber.trim() },
  //     ])
  //     setNewSerialNumber("")
  //     setIsManualRejectModalOpen(false)
  //   }
  // }

  // Handle deleting an entry
  const handleDeleteEntry = (id: any) => {
    setManualRejectEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id))
  }

  const handleDownload = (section: string) => {
    // Common metadata for most sections
    const metadata = ["SIRIM SERIAL NO.", "BATCH NO", "BRAND/TRADEMARK", "MODEL", "TYPE", "RATING", "SIZE"]

    // Function to map data items to the common structure
    const mapData = (dataSource: any[]) => {
      return dataSource.map((item: any) => [
        item.serial || item.serialNumber, // Handle different naming conventions
        batchNo,
        productData.brand,
        productData.model,
        productData.type,
        productData.rating,
        productData.size,
      ])
    }

    let data: any = []
    let title = "Report"
    let sheets = []

    // For different sections, get the relevant data
    switch (section) {
      case "captured":
        data = capturedData.filter(
          (item) =>
            !missingData.some((dup) => dup.serial === item.serial) &&
            !manualRejectEntries.some((dup) => dup.serialNumber === item.serial) &&
            item.status !== "NG"
        )
        title = "SIRIM REPORT"
        sheets.push({ title, metadata, data: mapData(data) })
        break

      case "manual-reject":
        data = manualRejectEntries
        title = "MANUAL REJECT REPORT"
        sheets.push({ title, metadata, data: mapData(data) })
        break

      case "missing":
        data = missingData
        title = "MISSING REPORT"
        sheets.push({ title, metadata, data: mapData(data) })
        break

      case "duplicate":
        data = duplicatedData
        title = "DUPLICATE REPORT"
        sheets.push({ title, metadata, data: mapData(data) })
        break

      case "unused-serials":
        metadata.splice(1) // Only "SIRIM SERIAL NO."
        data = remainingSerials.map((item: any) => [item])
        title = "UNUSED SERIALS REPORT"
        sheets.push({ title, metadata, data })
        break

      case "all":
        // Combine all sections' data into a single download
        sheets = [
          {
            title: "SIRIM REPORT",
            metadata,
            data: mapData(
              capturedData.filter(
                (item) =>
                  !missingData.some((dup) => dup.serial === item.serial) &&
                  !manualRejectEntries.some((dup) => dup.serialNumber === item.serial),
              ),
            ),
          },
          { title: "MANUAL REJECT REPORT", metadata, data: mapData(manualRejectEntries) },
          { title: "MISSING REPORT", metadata, data: mapData(missingData) },
          { title: "DUPLICATE REPORT", metadata, data: mapData(duplicatedData) },
          {
            title: "UNUSED SERIALS REPORT",
            metadata: ["SIRIM SERIAL NO."],
            data: remainingSerials.map((item: any) => [item]),
          },
        ]
        break

      default:
        console.error("Invalid section")
        return
    }

    // Save all the sections to Excel
    try {
      window.excel.save_to_excel(sheets)
    } catch (error) {
      console.error("Failed to save to Excel:", error)
    }
  }

  useEffect(() => {
    if (conn !== "connected" && productionStatus === "RUNNING") {
      setProdStatus("hold")
      setProductionStatus("HOLD")
    }
  }, [conn])

  useEffect(() => {
    if (productionStatus !== "RUNNING") {
      return () => {
        // window.tcpConnection.tcp_start_receive(false)
        window.tcpConnection.tcp_received(undefined); // Properly remove listener
      };
    }

    const handleTcpData = (data: any) => {
      let [serial, url, status] = data.split(',').map((data: string) => data.trim());
      console.log("Received Data:", data);

      if (!status) return; // Ignore invalid data
      if (productionStatus !== "RUNNING") return;

      setCapturedData((prevData) => {
        if (prevData.length > 0) {
          const lastEntry = prevData[prevData.length - 1];
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/);

          if (match) {
            const prefix = match[1];
            const lastSerialNum = parseInt(match[2], 10);
            const numLength = match[2].length;

            const currentMatch = serial.match(/^([A-Za-z]+)(\d+)$/);
            if (currentMatch) {
              const currentSerialNum = parseInt(currentMatch[2], 10);
              if (currentSerialNum > lastSerialNum + 1) {
                for (let i = lastSerialNum + 1; i < currentSerialNum; i++) {
                  const skippedSerial = `${prefix}${String(i).padStart(numLength, "0")}`;
                  setMissingData((prevMissing) => [...prevMissing, { serial: skippedSerial, url: lastEntry.url, status: "MISSING" }]);
                }
              }
            }
          }
        }
        return prevData;
      });

      if (!serial || !url) {
        setCapturedData((prevData) => {
          if (prevData.length === 0) return prevData;

          const lastEntry = prevData[prevData.length - 1];
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/);
          if (!match) return prevData;

          const prefix = match[1];
          const lastSerialNum = parseInt(match[2], 10);
          const numLength = match[2].length;

          const newSerialNum = lastSerialNum + 1;
          serial = `${prefix}${String(newSerialNum).padStart(numLength, "0")}`;

          url = lastEntry.url;
          const newEntry = { serial, url, status };

          setMissingData((prevMissing) => [...prevMissing, newEntry]);
          return [...prevData, newEntry];
        });
        return;
      }

      if (serial && url && status === "NG") {
        setCapturedData((prevData) => {
          if (prevData.length === 0) return prevData;

          const lastEntry = prevData[prevData.length - 1];
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/);
          if (!match) return prevData;

          const prefix = match[1];
          const lastSerialNum = parseInt(match[2], 10);
          const numLength = match[2].length;

          const newSerialNum = lastSerialNum + 1;
          serial = `${prefix}${String(newSerialNum).padStart(numLength, "0")}`;

          url = lastEntry.url;
          const newEntry = { serial, url, status };

          setMissingData((prevMissing) => [...prevMissing, newEntry]);
          return [...prevData, newEntry];
        });
        return;
      }

      const serialNum = parseInt(serial.replace(/\D/g, ""), 10);
      const isValidSerial = labelRolls.some(({ startNumber, endNumber }) => {
        const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/);
        const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/);
        if (!startMatch || !endMatch) return false;

        const startPrefix = startMatch[1];
        const endPrefix = endMatch[1];
        if (startPrefix !== endPrefix) return false;

        const start = parseInt(startMatch[2], 10);
        const end = parseInt(endMatch[2], 10);

        return serial.startsWith(startPrefix) && serialNum >= start && serialNum <= end;
      });

      if (!isValidSerial) return;

      setCapturedData((prevData) => {
        const alreadyCaptured = prevData.some(entry => entry.serial === serial);

        if (alreadyCaptured) {
          setDuplicatedData((prevDuplicates) => {
            if (!prevDuplicates.some(dup => dup.serial === serial)) {
              return [...prevDuplicates, { serial, url, status }];
            }
            return prevDuplicates;
          });

          window.serial.serial_com_send("@0101\r");
          return prevData;
        }

        if (manualRejectEntries.some(entry => entry.serialNumber === serial)) {
          return prevData;
        }

        return [...prevData, { serial, url, status }];
      });
    };

    window.tcpConnection.tcp_received(handleTcpData);

    return () => {
      window.tcpConnection.tcp_received(undefined); // Properly remove listener
      // window.tcpConnection.tcp_start_receive(false)
    };
  }, [productionStatus]);


  // Generate list of all possible serials
  const totalSerials = labelRolls.flatMap(({ startNumber, endNumber }) => {
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

  // Get only the valid used serials (excluding missing & duplicates)
  const usedSerials = capturedData.map(({ serial }) => serial)

  // Calculate remaining serials
  const remainingSerials = totalSerials.filter((serial) => !usedSerials.includes(serial))

  console.log("Used Serials:", usedSerials)
  console.log("Remaining Serials:", remainingSerials)

  return (
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
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
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
                            <Input id="productionDate" value={today} readOnly className="col-span-3 bg-muted" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="batchNo" className="text-right">
                              Batch No.
                            </Label>
                            <Input
                              id="batchNo"
                              value={batchNo}
                              disabled={productionStatus === "RUNNING"}
                              onChange={(e) => {
                                setBatchNo(e.target.value)
                                // if (batches.find((batch: any) => batch.batch_no === e.target.value)) {
                                //   setBatchError(true)
                                // } else {
                                //   setBatchError(false)
                                // }
                              }}
                              className={`col-span-3 ${batchError ? "border-red-500" : ""}`}
                              placeholder="Enter batch number"
                            />
                            {/* {batchError && (
                              <div className="text-right text-xs col-span-4 text-red-500">
                                {"Batch number already exists"}
                              </div>
                            )} */}
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
                              placeholder="Enter batch number"
                            />
                            {batchError && (
                              <div className="text-right text-xs col-span-4 text-red-500">
                                {"Shift number already exists"}
                              </div>
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
                                    products.map((product) => (
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

                            {labelRolls.map((roll) => (
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

                          <div className="grid grid-cols-4 items-center gap-4 mt-4">
                            <Label className="text-right font-semibold">Estimated Total Labels:</Label>
                            <div className="col-span-3 font-bold text-lg">
                              {calculateTotalLabels().toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={saveProduction}
                            disabled={
                              productionStatus === "RUNNING" || labelRolls.some((roll) => !roll.verified) || batchError
                            }
                          >
                            Save Production Batch
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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

                {/* Production Data Display */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Production Data */}
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

                  {/* Reading Captured Data */}
                  <Card className="col-span-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">READING CAPTURED DATA</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{capturedData.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("captured")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      {capturedData.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.status === "OK" && (
                            `${item.serial}, ${item.url}, ${item.status}`
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Auto-Reject Data */}
                  <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">UNUSED SERIAL NO</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{remainingSerials.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("unused-serials")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      {remainingSerials.map((item, index) => (
                        <div key={index} className="text-sm text-red-500">
                          {`${item}`}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Bottom Row */}
                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">MISSING SERIAL NO & NG</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{missingData.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("missing")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      {missingData.map((item, index) => (
                        <div key={index} className="text-sm text-red-500">
                          {`${item.serial}, ${item.url}, ${item.status}`}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">DUPLICATED SERIAL NO</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{duplicatedData.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("duplicate")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      {duplicatedData.map((item, index) => (
                        <div key={index} className="text-sm text-red-500">
                          {`${item.serial}, ${item.url}, ${item.status}`}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">MANUAL-REJECT SERIAL NO</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{manualRejectEntries.length}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload("manual-reject")}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[200px] overflow-y-auto">
                      <div className="space-y-2">
                        {manualRejectEntries.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between text-sm">
                            <span>{entry.serialNumber}</span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="ml-2"
                            >
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Dialog open={isManualRejectModalOpen} onOpenChange={setIsManualRejectModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="mt-4">
                            ADD ENTRY
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add Manual Reject Entries</DialogTitle>
                            <DialogDescription>
                              Enter the serial numbers for the manual reject entries.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            {newSerialNumbers.map((serialNumber, index) => (
                              <div key={index} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={`serialNumber-${index}`} className="text-right">
                                  Serial Number {index + 1}
                                </Label>
                                <Input
                                  id={`serialNumber-${index}`}
                                  value={serialNumber}
                                  onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                                  className="col-span-3"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveSerialNumberField(index)}
                                  className="col-span-1"
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={handleAddSerialNumberField}>
                              Add Another Serial Number
                            </Button>
                            <Button type="button" onClick={addManualRejectEntries}>
                              Add Entries
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}

