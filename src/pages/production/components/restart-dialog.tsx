"use client"

import React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface RestartDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function RestartDialog({ isOpen, onOpenChange, onConfirm }: RestartDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Restart Application</AlertDialogTitle>
                    <AlertDialogDescription>
                        The report has been generated successfully. Would you like to restart the application to start a new production?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Restart
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 