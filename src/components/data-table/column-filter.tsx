import { useState } from "react";
import { type Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title?: string;
  placeholder?: string;
}

export function DataTableColumnFilter<TData, TValue>({
  column,
  title,
  placeholder,
}: DataTableColumnFilterProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const filterValue = (column.getFilterValue() as string) ?? "";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 text-xs border-dashed",
            filterValue && "border-solid bg-muted"
          )}
        >
          <Search className="mr-1 h-3 w-3" />
          {filterValue ? (
            <span className="max-w-[100px] truncate">{filterValue}</span>
          ) : (
            <span className="text-muted-foreground">Lọc</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-3">
          <Input
            placeholder={placeholder || `Tìm kiếm ${title || column.id}...`}
            value={filterValue}
            onChange={(e) => {
              const value = e.target.value;
              column.setFilterValue(value || undefined);
            }}
            className="h-8"
          />
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                column.setFilterValue(undefined);
                setIsOpen(false);
              }}
              className="h-8"
            >
              <X className="mr-2 h-4 w-4" />
              Xóa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8"
            >
              Đóng
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
