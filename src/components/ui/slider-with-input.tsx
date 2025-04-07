"use client"

import React from "react"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SliderWithInputProps {
    label?: string
    min?: number
    max?: number
    step?: number
    defaultValue?: number
    className?: string
    setSliderValue?: (value: number) => void
}

export function SliderWithInput({
    label = "Value",
    min = 0,
    max = 100,
    step = 1,
    defaultValue = 50,
    className,
    setSliderValue
}: SliderWithInputProps) {
    const [value, setValue] = useState(defaultValue)

    const handleSliderChange = (newValue: number[]) => {
        setSliderValue && setSliderValue(newValue[0])
        setValue(newValue[0])
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number.parseInt(e.target.value, 10)
        if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            setSliderValue && setSliderValue(newValue)
            setValue(newValue)
        }
    }

    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label>{label}</Label>}
            <div className="flex items-center gap-4">
                <Slider value={[value]} min={min} max={max} step={step} onValueChange={handleSliderChange} className="flex-1" />
                <Input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    step={step}
                    className="w-20"
                />
            </div>
        </div>
    )
}

