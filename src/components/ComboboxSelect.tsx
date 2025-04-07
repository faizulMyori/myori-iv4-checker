
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState } from "react";
import React from "react";

interface ComboboxSelectProps {
    options: any;
    value: any;
    onChange: (value: string) => void;
    placeholder: any;
    valueToDisplay?: (watch: any) => any;
    disabled?: boolean
}

export default function ComboboxSelect({ options, value, onChange, placeholder, valueToDisplay, disabled }: ComboboxSelectProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {value
                        ? (() => {
                            const selectedOption = options.find((option: any) => option.id.toString() === value);
                            return selectedOption ? (valueToDisplay ? valueToDisplay(selectedOption) : selectedOption.name) : placeholder;
                        })()
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
                    <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {options.map((option: any) => (
                                <CommandItem
                                    key={option.id}
                                    onSelect={() => {
                                        onChange(option.id.toString());
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.id.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {valueToDisplay ? valueToDisplay(option) : option.name}
                                </CommandItem>
                            ))}
                        </CommandList>

                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}