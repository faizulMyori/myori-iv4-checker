"use client"

import { useState } from "react"

export type LabelRoll = {
  id: string
  rollNumber: string
  startNumber: string
  endNumber: string
  verified: boolean
}

export function useLabelRolls() {
  const [labelRolls, setLabelRolls] = useState<LabelRoll[]>([
    { id: "1", rollNumber: "1", startNumber: "", endNumber: "", verified: false },
  ])

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

  return {
    labelRolls,
    setLabelRolls,
    addLabelRoll,
    updateLabelRoll,
    verifyLabelRoll,
    calculateTotalLabels,
  }
}

