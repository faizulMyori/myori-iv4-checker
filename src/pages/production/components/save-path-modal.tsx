"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import React from "react"

interface SavePathModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    savePath: string
}

export default function SavePathModal({ isOpen, onClose, onConfirm, savePath }: SavePathModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Excel Save Location</DialogTitle>
                    <DialogDescription>
                        The Excel file will be saved to the following location:
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                        {savePath}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 