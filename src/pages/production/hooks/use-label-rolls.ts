"use client"

import { useState } from "react"
import { toast } from "sonner"

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
    if (!roll || !roll.rollNumber || !roll.startNumber || !roll.endNumber) {
      toast.error("Invalid roll data", {
        description: "Please fill in all fields for the roll",
      })
      return
    }

    const startMatch = roll.startNumber.match(/^([A-Za-z]+)(\d+)$/)
    const endMatch = roll.endNumber.match(/^([A-Za-z]+)(\d+)$/)

    if (!startMatch || !endMatch) {
      toast.error("Invalid format", {
        description: "Serial numbers must be in the format: [Letters][Numbers] (e.g., ABC123)",
      })
      return
    }

    const startPrefix = startMatch[1]
    const endPrefix = endMatch[1]

    if (startPrefix !== endPrefix) {
      toast.error("Prefix mismatch", {
        description: "Start and end serial numbers must have the same prefix",
      })
      return
    }

    const start = Number.parseInt(startMatch[2], 10)
    const end = Number.parseInt(endMatch[2], 10)

    if (isNaN(start) || isNaN(end)) {
      toast.error("Invalid numbers", {
        description: "Serial numbers must contain valid numbers",
      })
      return
    }

    if (end < start) {
      toast.error("Invalid range", {
        description: "End number must be greater than or equal to start number",
      })
      return
    }

    // Check if serial number exists from start to end in the database
    const startNumber = roll.startNumber
    const endNumber = roll.endNumber
    window.sqlite.check_serial_numbers({ startNumber, endNumber }).then((data: any) => {
      if (data.length > 0) {
        let serials = data.map((item: any) => item.serial);
        toast.error("Serial numbers exist", {
          description: `Serial number ${serials.join(", ")} already exists in the database`,
        })
        return
      }

      // Check for duplicate serial numbers in the list of label rolls
      const duplicateRoll = labelRolls.find((r) => {
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

      if (duplicateRoll) {
        console.log(duplicateRoll)
        toast.error("Duplicate range", {
          description: `This range overlaps with roll ${duplicateRoll.rollNumber} (${duplicateRoll.startNumber} - ${duplicateRoll.endNumber})`,
        })
        return
      }

      updateLabelRoll(id, "verified", true)
      toast.success("Roll verified", {
        description: "The roll has been successfully verified",
      })
    })
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

