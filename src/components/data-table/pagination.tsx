import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { cn, getPageNumbers } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  className?: string;
  pageSizeOptions?: number[];
};

export function DataTablePagination<TData>({
  table,
  className,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 px-2",
        className
      )}
    >
      {/* Page size selector - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        <p className="text-sm font-medium text-gray-700">Số hàng mỗi trang</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        {/* Page info - simplified on mobile */}
        <div className="text-xs sm:text-sm font-medium text-gray-700">
          <span className="md:hidden">Trang {currentPage}/{totalPages || 1}</span>
          <span className="hidden md:inline">Trang {currentPage} / {totalPages || 1}</span>
        </div>
        <div className="flex items-center space-x-1">
          {/* First page button - hidden on mobile */}
          <Button
            variant="outline"
            className="hidden sm:flex h-8 w-8 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang đầu</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          {/* Previous page button */}
          <Button
            variant="outline"
            className="h-9 w-9 sm:h-8 sm:w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page number buttons - hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-1">
            {pageNumbers.map((pageNumber, index) => (
              <div key={`${pageNumber}-${index}`} className="flex items-center">
                {pageNumber === "..." ? (
                  <span className="px-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    className="h-8 min-w-8 px-2"
                    onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                  >
                    <span className="sr-only">Đến trang {pageNumber}</span>
                    {pageNumber}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            className="h-9 w-9 sm:h-8 sm:w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* Last page button - hidden on mobile */}
          <Button
            variant="outline"
            className="hidden sm:flex h-8 w-8 p-0"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang cuối</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
