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

interface FormDialogProps {
    title: string,
    forms: any
    setOpenForm: any
    setConfirmForm: any
    processing: boolean
    openDialog: boolean
    size?: string
    formType?: string
}

export function FormDialog(props: FormDialogProps) {
    const [open, setOpen] = useState(props.openDialog);

    useEffect(() => {
        props.setOpenForm(open)
    }, [open])

    function handleCancel() {
        props.setOpenForm(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogContent
                    className={(props.size ? props.size : "sm:max-w-[425px] ")}
                    onInteractOutside={(e) => {
                        e.preventDefault();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {props.title}
                        </DialogTitle>
                    </DialogHeader>
                    {
                        props.forms
                    }
                    <DialogFooter>
                        {
                            props.formType !== 'view' && <Button onClick={props.setConfirmForm} disabled={props.processing}>Confirm</Button>
                        }

                        <Button onClick={handleCancel} variant={"outline"}>{props.formType === 'view' ? 'Close' : 'Cancel'}</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}