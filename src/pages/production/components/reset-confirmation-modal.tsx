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
import React from "react"

interface ResetConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export default function ResetConfirmationModal({ isOpen, onClose, onConfirm }: ResetConfirmationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reset Production</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to reset the production? This will clear all production data and cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Reset Production
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 