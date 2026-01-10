import { useState } from "react";
import { type Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableColumnFilterSelectProps<TData, TValue> {
  column: Column<TData, TValue>;
  title?: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export function DataTableColumnFilterSelect<TData, TValue>({
  column,
  title,
  options,
  placeholder = "Chọn giá trị...",
}: DataTableColumnFilterSelectProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const filterValue = (column.getFilterValue() as string) ?? "";
  const selectedOption = options.find((opt) => opt.value === filterValue);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 text-xs border-dashed justify-between",
            filterValue && "border-solid bg-muted"
          )}
        >
          <span className="max-w-[80px] truncate">
            {selectedOption ? selectedOption.label : "Lọc"}
          </span>
          <div className="flex items-center gap-1">
            {filterValue && (
              <X
                className="h-3 w-3 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  column.setFilterValue(undefined);
                }}
              />
            )}
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  column.setFilterValue(undefined);
                  setIsOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !filterValue || filterValue === "" ? "opacity-100" : "opacity-0"
                  )}
                />
                Tất cả
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    column.setFilterValue(
                      filterValue === option.value ? undefined : option.value
                    );
                    setIsOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      filterValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
