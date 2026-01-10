import { useMemo, useState } from "react";
import {
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination, DataTableColumnFilterInput } from "@/components/data-table";
import { createBookingColumns, type BookingRow } from "./booking-columns";

interface BookingTableProps {
  bookings: BookingRow[];
  onViewDetails: (bookingId: string) => void;
  onAccept?: (bookingId: string) => void;
  onDeny?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  // Pagination props (server-side)
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Sorting props (server-side)
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  // Loading state
  isLoading?: boolean;
}

export function BookingTable({
  bookings,
  onViewDetails,
  onAccept,
  onDeny,
  onCancel,
  totalPages = 1,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  sorting = [],
  onSortingChange,
  isLoading = false,
}: BookingTableProps) {
  // Create columns with action handlers
  const columns = useMemo(
    () =>
      createBookingColumns({
        onViewDetails,
        onAccept,
        onDeny,
        onCancel,
      }),
    [onViewDetails, onAccept, onDeny, onCancel]
  );

  // Column visibility state (client-side)
  const columnVisibility: VisibilityState = {};
  
  // Column filters state (client-side)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Create table instance
  const table = useReactTable({
    data: bookings,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    // Server-side pagination
    manualPagination: true,
    pageCount: totalPages,
    // Server-side sorting
    manualSorting: true,
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange?.(newSorting);
    },
    onPaginationChange: (updater) => {
      const current = { pageIndex: currentPage - 1, pageSize };
      const next = typeof updater === "function" ? updater(current) : updater;
      if (next.pageIndex !== current.pageIndex) {
        onPageChange?.(next.pageIndex + 1);
      }
      if (next.pageSize !== current.pageSize) {
        onPageSizeChange?.(next.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-4">
      <div className="w-full bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <>
                  {/* Header Row */}
                  <TableRow key={headerGroup.id} className="bg-gray-50 border-b">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "font-semibold text-gray-900 text-left py-4",
                          header.column.columnDef.meta?.className
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                  {/* Filter Row */}
                  <TableRow key={`${headerGroup.id}-filter`} className="bg-white border-b">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={`${header.id}-filter`}
                        className={cn(
                          "py-2",
                          header.column.columnDef.meta?.className
                        )}
                      >
                        {header.column.getCanFilter() ? (
                          <DataTableColumnFilterInput
                            column={header.column}
                            placeholder="Tìm kiếm"
                          />
                        ) : null}
                      </TableHead>
                    ))}
                  </TableRow>
                </>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b hover:bg-gray-50"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3.5 text-left",
                          cell.column.columnDef.meta?.className
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <DataTablePagination table={table} pageSizeOptions={[10, 20, 30, 50]} />
      )}
    </div>
  );
}

// Re-export types for backward compatibility
export type { BookingRow } from "./booking-columns";
