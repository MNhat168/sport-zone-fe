import { type Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableColumnFilterInputProps<TData, TValue> {
  column: Column<TData, TValue>;
  placeholder?: string;
  className?: string;
}

export function DataTableColumnFilterInput<TData, TValue>({
  column,
  placeholder = "Tìm kiếm",
  className,
}: DataTableColumnFilterInputProps<TData, TValue>) {
  const filterValue = (column.getFilterValue() as string) ?? "";

  if (!column.getCanFilter()) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={filterValue}
        onChange={(e) => {
          const value = e.target.value;
          column.setFilterValue(value || undefined);
        }}
        className={cn(
          "h-8 pl-8 pr-8",
          filterValue && "pr-8"
        )}
      />
      {filterValue && (
        <button
          onClick={() => column.setFilterValue(undefined)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
