"use client"

import { useState, useEffect } from "react"
import type { LabelRoll } from "./use-label-rolls"

export function useDataCapture(productionStatus: string, labelRolls: LabelRoll[]) {
  const [capturedData, setCapturedData] = useState<any[]>([])
  const [duplicatedData, setDuplicatedData] = useState<any[]>([])
  const [missingData, setMissingData] = useState<any[]>([])

  useEffect(() => {
    if (productionStatus !== "RUNNING") {
      return () => {
        window.tcpConnection.tcp_received(undefined) // Properly remove listener
      }
    }

    const handleTcpData = (data: any) => {
      let [serial, url, status] = data.split(",").map((data: string) => data.trim())
      console.log("Received Data:", data)

      if (!status) return // Ignore invalid data
      if (productionStatus !== "RUNNING") return

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
              const currentSerialNum = Number.parseInt(currentMatch[2], 10)
              if (currentSerialNum > lastSerialNum + 1) {
                for (let i = lastSerialNum + 1; i < currentSerialNum; i++) {
                  const skippedSerial = `${prefix}${String(i).padStart(numLength, "0")}`
                  setMissingData((prevMissing) => [
                    ...prevMissing,
                    { serial: skippedSerial, url: lastEntry.url, status: "MISSING" },
                  ])
                }
              }
            }
          }
        }
        return prevData
      })

      if (!serial || !url) {
        setCapturedData((prevData) => {
          if (prevData.length === 0) return prevData

          const lastEntry = prevData[prevData.length - 1]
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/)
          if (!match) return prevData

          const prefix = match[1]
          const lastSerialNum = Number.parseInt(match[2], 10)
          const numLength = match[2].length

          const newSerialNum = lastSerialNum + 1
          serial = `${prefix}${String(newSerialNum).padStart(numLength, "0")}`

          url = lastEntry.url
          const newEntry = { serial, url, status }

          setMissingData((prevMissing) => [...prevMissing, newEntry])
          return [...prevData, newEntry]
        })
        return
      }

      if (serial && url && status === "NG") {
        setCapturedData((prevData) => {
          if (prevData.length === 0) return prevData

          const lastEntry = prevData[prevData.length - 1]
          const match = lastEntry.serial.match(/^([A-Za-z]+)(\d+)$/)
          if (!match) return prevData

          const prefix = match[1]
          const lastSerialNum = Number.parseInt(match[2], 10)
          const numLength = match[2].length

          const newSerialNum = lastSerialNum + 1
          serial = `${prefix}${String(newSerialNum).padStart(numLength, "0")}`

          url = lastEntry.url
          const newEntry = { serial, url, status }

          setMissingData((prevMissing) => [...prevMissing, newEntry])
          return [...prevData, newEntry]
        })
        return
      }

      const serialNum = Number.parseInt(serial.replace(/\D/g, ""), 10)
      const isValidSerial = labelRolls.some(({ startNumber, endNumber }) => {
        const startMatch = startNumber.match(/^([A-Za-z]+)(\d+)$/)
        const endMatch = endNumber.match(/^([A-Za-z]+)(\d+)$/)
        if (!startMatch || !endMatch) return false

        const startPrefix = startMatch[1]
        const endPrefix = endMatch[1]
        if (startPrefix !== endPrefix) return false

        const start = Number.parseInt(startMatch[2], 10)
        const end = Number.parseInt(endMatch[2], 10)

        return serial.startsWith(startPrefix) && serialNum >= start && serialNum <= end
      })

      if (!isValidSerial) return

      setCapturedData((prevData) => {
        const alreadyCaptured = prevData.some((entry) => entry.serial === serial)

        if (alreadyCaptured) {
          setDuplicatedData((prevDuplicates) => {
            if (!prevDuplicates.some((dup) => dup.serial === serial)) {
              return [...prevDuplicates, { serial, url, status }]
            }
            return prevDuplicates
          })

          window.serial.serial_com_send("@0101\r");
          setTimeout(() => {
            window.serial.serial_com_send("@0100\r");
          }, 100);
          return prevData
        }

        return [...prevData, { serial, url, status }]
      })
    }

    window.tcpConnection.tcp_received(handleTcpData)

    return () => {
      window.tcpConnection.tcp_received(undefined) // Properly remove listener
    }
  }, [productionStatus, labelRolls])

  return {
    capturedData,
    setCapturedData,
    duplicatedData,
    setDuplicatedData,
    missingData,
    setMissingData,
  }
}

