"use client"

import * as React from "react"
import { ChevronDownIcon, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
    label?: string
    value?: Date
    onChange?: (date: Date | undefined) => void
    disabled?: (date: Date) => boolean
    id?: string
    buttonClassName?: string
    popoverAlign?: "start" | "center" | "end"
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
}

export function DatePicker({
    label = "Chọn ngày",
    value,
    onChange,
    disabled,
    id = "date",
    buttonClassName,
    popoverAlign = "start",
    captionLayout = "dropdown",
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(undefined)

    const selectedDate = value ?? internalDate

    const handleSelect = (next?: Date) => {
        setInternalDate(next)
        onChange?.(next)
        setOpen(false)
    }

    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor={id} className="px-1">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={id}
                        data-empty={!selectedDate}
                        className={`data-[empty=true]:text-muted-foreground w-full justify-between font-normal ${buttonClassName ?? ''}`}
                    >
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP') : label}
                        </div>
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align={popoverAlign}>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        disabled={disabled}
                        captionLayout={captionLayout}
                        onSelect={handleSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

// Backward-compatible named export if previously used elsewhere
export function Calendar22() {
    return <DatePicker label="Ngày" />
}
