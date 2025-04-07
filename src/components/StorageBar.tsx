import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HardDrive } from "lucide-react"
import React from "react"

interface StorageInfo {
    diskPath: string
    free: number
    size: number
}

interface StorageBarProps {
    storage: StorageInfo
}

export default function StorageBar({ storage }: StorageBarProps) {
    const { diskPath, free, size } = storage

    // Calculate used space and percentage
    const used = size - free
    const usedPercentage = Math.round((used / size) * 100)

    // Format bytes to human-readable format
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes"

        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    // Convert bytes to GB
    const bytesToGB = (bytes: number): string => {
        const gb = bytes / (1024 * 1024 * 1024)
        return gb.toFixed(2) + " GB"
    }

    // Determine color based on usage percentage
    const getColorClass = (percentage: number): string => {
        if (percentage >= 90) return "text-destructive"
        if (percentage >= 75) return "text-warning"
        return "text-muted-foreground"
    }

    const colorClass = getColorClass(usedPercentage)

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <HardDrive className="h-5 w-5" />
                    <span>Storage - {diskPath}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Progress value={usedPercentage} className="h-2" />

                    <div className="flex justify-between text-sm">
                        <div>
                            <p className="font-medium">Used</p>
                            <p className={colorClass}>{formatBytes(used)}</p>
                        </div>

                        <div>
                            <p className="font-medium">Free</p>
                            <p className="text-muted-foreground">{formatBytes(free)}</p>
                        </div>

                        <div>
                            <p className="font-medium">Total</p>
                            <p className="text-muted-foreground">{formatBytes(size)}</p>
                        </div>
                    </div>

                    <p className={`text-sm ${colorClass}`}>{usedPercentage}% used</p>
                </div>

                {/* <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium">Example conversion:</p>
                    <p className="text-sm">12345678 bytes = {bytesToGB(12345678)}</p>
                </div> */}
            </CardContent>
        </Card>
    )
}

