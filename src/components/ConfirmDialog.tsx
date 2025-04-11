import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import React from "react";
import { useEffect, useState } from "react";

export function ConfirmDialog(props: any) {
    const [open, setOpen] = useState(props.open);

    useEffect(() => {
        props.setOpen(open)
    }, [open])

    function handleSubmit(event: any) {
        event.preventDefault();
        props.setConfirm(true)
    }

    function handleCancel() {
        props.setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="sm:max-w-[425px]"
                onInteractOutside={(e: any) => {
                    e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {props.title}
                    </DialogTitle>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Confirm</Button>
                    <Button onClick={handleCancel} variant={"outline"}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}